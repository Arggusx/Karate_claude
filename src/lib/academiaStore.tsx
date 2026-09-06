"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MENSALIDADE_PADRAO_CENTAVOS,
  corDaFaixa,
} from "@/services/dataService";
import type {
  Aluno,
  AulaPlano,
  Chamada,
  CriteriosProgresso,
  Professor,
  Sessao,
  Turma,
} from "@/types";

/**
 * Estado da academia lido do banco (Neon) através de /api/academia.
 *
 * A sessão NÃO é guardada no navegador: quem manda é o cookie httpOnly
 * assinado pelo servidor. O que existe aqui é apenas um espelho para a
 * interface saber que nome mostrar — o servidor revalida a cada chamada.
 */

interface Resultado {
  ok: boolean;
  erro?: string;
  sessao?: Sessao;
}

interface AcademiaContexto {
  carregado: boolean;
  turmas: Turma[];
  alunos: Aluno[];
  professores: Professor[];
  sessao: Sessao | null;
  /** Mensalidade em centavos, definida pelo servidor. */
  mensalidadeCentavos: number;
  erroCarregamento: string | null;
  recarregar: () => Promise<void>;
  alunosDaTurma: (turmaId: string) => Aluno[];
  professorDaTurma: (turmaId: string) => Professor | undefined;
  usuarioEmUso: (usuario: string, ignorarId?: string) => boolean;
  usuarioDisponivel: (base: string) => string;
  criarTurma: (turma: Omit<Turma, "id" | "plano"> & { plano?: AulaPlano[] }) => void;
  atualizarTurma: (id: string, mudancas: Partial<Turma>) => void;
  removerTurma: (id: string) => void;
  moverAluno: (alunoId: string, turmaId: string) => Promise<void>;
  atualizarAluno: (
    alunoId: string,
    mudancas: { faixa?: string; dataNascimento?: string | null },
  ) => Promise<Resultado>;
  desmatricularAluno: (alunoId: string) => Promise<Resultado>;
  /** Lê a chamada já gravada de uma turma num dia. */
  lerChamada: (turmaId: string, data: string) => Promise<Chamada>;
  salvarChamada: (
    turmaId: string,
    data: string,
    chamada: Chamada,
    alunosDaChamada: string[],
  ) => Promise<Resultado>;
  lerPrograma: (
    alunoId: string,
  ) => Promise<{ tipo: string; item: string }[]>;
  marcarItemPrograma: (
    alunoId: string,
    dados: { tipo: "kata" | "kihon"; item: string; concluido: boolean },
  ) => Promise<Resultado>;
  removerProfessor: (professorId: string) => Promise<Resultado>;
  criarAluno: (
    aluno: Omit<Aluno, "id" | "foto"> & { email?: string },
  ) => Promise<Resultado>;
  criarProfessor: (
    professor: Omit<Professor, "id" | "foto"> & { senha: string },
  ) => Promise<Resultado>;
  entrar: (usuario: string, senha: string) => Promise<Resultado>;
  sair: () => Promise<void>;
}

const Contexto = createContext<AcademiaContexto | null>(null);

/** Iniciais do avatar: primeiro e último nome, ignorando partículas. */
const iniciais = (nome: string) => {
  const partes = nome
    .replace(/^(Sensei|Senpai)\s+/i, "")
    .split(/\s+/)
    .filter((parte) => parte.length > 2);
  if (partes.length === 0) return nome.slice(0, 2).toUpperCase();
  const primeiro = partes[0][0];
  const ultimo = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeiro + ultimo).toUpperCase();
};

/** "19:30:00" → "19:30" */
const hora = (valor: string | null) => (valor ?? "").slice(0, 5);

interface RespostaAcademia {
  turmas: {
    id: number;
    nome: string;
    dias_semana: string;
    horario: string;
    hora_fim: string | null;
    faixa_etaria: string | null;
    faixas_tipicas: string | null;
    professor_id: number | null;
    plano: AulaPlano[];
  }[];
  alunos: {
    id: number;
    nome: string;
    usuario: string;
    data_nascimento: string | null;
    idade: number | null;
    turma_id: number | null;
    faixa_atual: string;
    progresso: number;
    frequencia: number;
    proximo_exame: string | null;
    financial_status: string;
    apto_exame: boolean;
    criterios: CriteriosProgresso | null;
  }[];
  professores: {
    id: number;
    nome: string;
    usuario: string;
    email: string;
    role: string;
    criado_em: string;
    data_nascimento: string | null;
    idade: number | null;
  }[];
  mensalidade_centavos?: number;
}

export function AcademiaProvider({ children }: { children: ReactNode }) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [mensalidadeCentavos, setMensalidadeCentavos] = useState(
    MENSALIDADE_PADRAO_CENTAVOS,
  );
  const [carregado, setCarregado] = useState(false);
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      const resposta = await fetch("/api/academia", { cache: "no-store" });
      const dados = (await resposta.json()) as RespostaAcademia & {
        erro?: string;
      };
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha ao carregar.");

      if (typeof dados.mensalidade_centavos === "number") {
        setMensalidadeCentavos(dados.mensalidade_centavos);
      }

      setTurmas(
        dados.turmas.map((turma) => ({
          id: String(turma.id),
          nome: turma.nome,
          faixaEtaria: turma.faixa_etaria ?? "",
          // "Terça e Quinta" → ["Terça", "Quinta"] sem partir o "e" de Terça.
          dias: turma.dias_semana.split(/\s*,\s*|\s+e\s+/).filter(Boolean),
          inicio: hora(turma.horario),
          fim: hora(turma.hora_fim),
          faixasTipicas: turma.faixas_tipicas ?? "",
          professorId: String(turma.professor_id ?? ""),
          plano: Array.isArray(turma.plano) ? turma.plano : [],
        })),
      );

      setAlunos(
        dados.alunos.map((aluno) => ({
          id: String(aluno.id),
          nome: aluno.nome,
          usuario: aluno.usuario,
          senha: "",
          dataNascimento: aluno.data_nascimento ?? "",
          idade: aluno.idade ?? 0,
          turmaId: String(aluno.turma_id ?? ""),
          faixa: aluno.faixa_atual,
          corFaixa: corDaFaixa(aluno.faixa_atual),
          progresso: aluno.progresso,
          proximoExame: aluno.proximo_exame ?? "A definir",
          status:
            aluno.financial_status === "ativo"
              ? "ativo"
              : aluno.financial_status === "atrasado"
                ? "atrasado"
                : "pendente",
          foto: iniciais(aluno.nome),
          frequencia: aluno.frequencia,
          aptoParaExame: aluno.apto_exame ?? false,
          criterios: aluno.criterios ?? null,
        })),
      );

      setProfessores(
        dados.professores.map((professor) => ({
          id: String(professor.id),
          nome: professor.nome,
          usuario: professor.usuario,
          senha: "",
          dataNascimento: professor.data_nascimento ?? "",
          idade: professor.idade ?? null,
          graduacao: professor.role === "admin" ? "Administração" : "Professor",
          email: professor.email,
          desde: professor.criado_em?.slice(0, 4) ?? "",
          foto: iniciais(professor.nome),
        })),
      );

      setErroCarregamento(null);
    } catch (falha) {
      setErroCarregamento(
        falha instanceof Error
          ? falha.message
          : "Não foi possível falar com o banco.",
      );
    }
  }, []);

  useEffect(() => {
    // Quem responde "quem é você" é o cookie assinado, lido no servidor.
    const restaurar = fetch("/api/auth/sessao", { cache: "no-store" })
      .then((resposta) => resposta.json())
      .then((dados) => setSessao(dados.sessao ?? null))
      .catch(() => setSessao(null));

    Promise.all([restaurar, recarregar()]).finally(() => setCarregado(true));
  }, [recarregar]);

  const alunosDaTurma = useCallback(
    (turmaId: string) => alunos.filter((aluno) => aluno.turmaId === turmaId),
    [alunos],
  );

  const professorDaTurma = useCallback(
    (turmaId: string) => {
      const turma = turmas.find((item) => item.id === turmaId);
      return professores.find((professor) => professor.id === turma?.professorId);
    },
    [turmas, professores],
  );

  const usuarioEmUso = useCallback(
    (usuario: string, ignorarId?: string) => {
      const alvo = usuario.trim().toLowerCase();
      if (!alvo) return false;
      return (
        alunos.some((a) => a.usuario === alvo && a.id !== ignorarId) ||
        professores.some((p) => p.usuario === alvo && p.id !== ignorarId)
      );
    },
    [alunos, professores],
  );

  const usuarioDisponivel = useCallback(
    (base: string) => {
      const raiz = base.trim().toLowerCase();
      if (!raiz) return "";
      if (!usuarioEmUso(raiz)) return raiz;
      let sufixo = 2;
      while (usuarioEmUso(`${raiz}${sufixo}`)) sufixo += 1;
      return `${raiz}${sufixo}`;
    },
    [usuarioEmUso],
  );

  // Turmas ainda são editadas em memória: a escrita no banco entra junto com
  // a tela de edição de turma (o formulário já existe e envia o mesmo shape).
  const criarTurma = useCallback<AcademiaContexto["criarTurma"]>((turma) => {
    setTurmas((atual) => [
      ...atual,
      { ...turma, plano: turma.plano ?? [], id: `t-${Date.now()}` },
    ]);
  }, []);

  const atualizarTurma = useCallback<AcademiaContexto["atualizarTurma"]>(
    (id, mudancas) => {
      setTurmas((atual) =>
        atual.map((turma) => (turma.id === id ? { ...turma, ...mudancas } : turma)),
      );
    },
    [],
  );

  const removerTurma = useCallback<AcademiaContexto["removerTurma"]>((id) => {
    setTurmas((atual) => atual.filter((turma) => turma.id !== id));
  }, []);

  const moverAluno = useCallback<AcademiaContexto["moverAluno"]>(
    async (alunoId, turmaId) => {
      const resposta = await fetch(`/api/academia/alunos/${alunoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turmaId: Number(turmaId) }),
      });
      if (!resposta.ok) {
        const dados = await resposta.json();
        throw new Error(dados.erro ?? "Falha ao mover o aluno.");
      }
      await recarregar();
    },
    [recarregar],
  );

  const atualizarAluno = useCallback<AcademiaContexto["atualizarAluno"]>(
    async (alunoId, mudancas) => {
      const resposta = await fetch(`/api/academia/alunos/${alunoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mudancas),
      });
      const dados = await resposta.json();
      if (!resposta.ok) return { ok: false, erro: dados.erro };

      await recarregar();
      return { ok: true };
    },
    [recarregar],
  );

  /**
   * Desmatricula desativando a conta no banco. O aluno some das listagens, mas
   * as mensalidades dele continuam existindo para consulta.
   */
  const desmatricularAluno = useCallback<
    AcademiaContexto["desmatricularAluno"]
  >(
    async (alunoId) => {
      const resposta = await fetch(`/api/academia/alunos/${alunoId}`, {
        method: "DELETE",
      });
      const dados = await resposta.json();
      if (!resposta.ok) return { ok: false, erro: dados.erro };

      await recarregar();
      return { ok: true };
    },
    [recarregar],
  );

  const removerProfessor = useCallback<AcademiaContexto["removerProfessor"]>(
    async (professorId) => {
      const resposta = await fetch(`/api/academia/professores/${professorId}`, {
        method: "DELETE",
      });
      const dados = await resposta.json();
      if (!resposta.ok) return { ok: false, erro: dados.erro };

      await recarregar();
      return { ok: true };
    },
    [recarregar],
  );

  const lerChamada = useCallback<AcademiaContexto["lerChamada"]>(
    async (turmaId, data) => {
      const resposta = await fetch(
        `/api/academia/chamada?turmaId=${turmaId}&data=${data}`,
        { cache: "no-store" },
      );
      if (!resposta.ok) return {};
      const dados = await resposta.json();
      return (dados.presencas ?? {}) as Chamada;
    },
    [],
  );

  /**
   * Manda a turma inteira, não só os presentes: quem não foi marcado precisa
   * virar uma falta explícita para a frequência ter denominador.
   */
  const salvarChamada = useCallback<AcademiaContexto["salvarChamada"]>(
    async (turmaId, data, chamada, alunosDaChamada) => {
      const resposta = await fetch("/api/academia/chamada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turmaId: Number(turmaId),
          data,
          presencas: alunosDaChamada.map((alunoId) => ({
            alunoId: Number(alunoId),
            presente: Boolean(chamada[alunoId]),
          })),
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) return { ok: false, erro: dados.erro };

      // A presença muda o progresso de quem esteve na chamada.
      await recarregar();
      return { ok: true };
    },
    [recarregar],
  );

  const lerPrograma = useCallback<AcademiaContexto["lerPrograma"]>(
    async (alunoId) => {
      const resposta = await fetch(
        `/api/academia/alunos/${alunoId}/programa`,
        { cache: "no-store" },
      );
      if (!resposta.ok) return [];
      const dados = await resposta.json();
      return dados.itens ?? [];
    },
    [],
  );

  const marcarItemPrograma = useCallback<
    AcademiaContexto["marcarItemPrograma"]
  >(
    async (alunoId, dados) => {
      const resposta = await fetch(
        `/api/academia/alunos/${alunoId}/programa`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        },
      );
      const corpo = await resposta.json();
      if (!resposta.ok) return { ok: false, erro: corpo.erro };

      await recarregar();
      return { ok: true };
    },
    [recarregar],
  );

  const criarAluno = useCallback<AcademiaContexto["criarAluno"]>(
    async (aluno) => {
      const resposta = await fetch("/api/academia/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: aluno.nome,
          usuario: aluno.usuario,
          senha: aluno.senha,
          email: aluno.email,
          dataNascimento: aluno.dataNascimento || null,
          idade: aluno.idade,
          turmaId: Number(aluno.turmaId) || null,
          faixa: aluno.faixa,
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) return { ok: false, erro: dados.erro };

      await recarregar();
      return { ok: true };
    },
    [recarregar],
  );

  const criarProfessor = useCallback<AcademiaContexto["criarProfessor"]>(
    async (professor) => {
      const resposta = await fetch("/api/academia/professores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: professor.nome,
          usuario: professor.usuario,
          senha: professor.senha,
          email: professor.email,
          dataNascimento: professor.dataNascimento || null,
        }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) return { ok: false, erro: dados.erro };

      await recarregar();
      return { ok: true };
    },
    [recarregar],
  );

  const entrar = useCallback<AcademiaContexto["entrar"]>(
    async (usuario, senha) => {
      try {
        const resposta = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, senha }),
        });
        const dados = await resposta.json();

        if (!resposta.ok) {
          return { ok: false, erro: dados.erro ?? "Não foi possível entrar." };
        }

        const nova: Sessao = {
          perfil: dados.conta.role,
          id: String(dados.conta.id),
          nome: dados.conta.nome,
          usuario: dados.conta.usuario,
        };
        setSessao(nova);
        return { ok: true, sessao: nova };
      } catch {
        return { ok: false, erro: "Falha de conexão com o servidor." };
      }
    },
    [],
  );

  const sair = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setSessao(null);
  }, []);

  const valor = useMemo(
    () => ({
      carregado,
      turmas,
      alunos,
      professores,
      sessao,
      mensalidadeCentavos,
      erroCarregamento,
      recarregar,
      alunosDaTurma,
      professorDaTurma,
      usuarioEmUso,
      usuarioDisponivel,
      criarTurma,
      atualizarTurma,
      removerTurma,
      moverAluno,
      atualizarAluno,
      desmatricularAluno,
      lerChamada,
      salvarChamada,
      lerPrograma,
      marcarItemPrograma,
      removerProfessor,
      criarAluno,
      criarProfessor,
      entrar,
      sair,
    }),
    [
      carregado,
      turmas,
      alunos,
      professores,
      sessao,
      mensalidadeCentavos,
      erroCarregamento,
      recarregar,
      alunosDaTurma,
      professorDaTurma,
      usuarioEmUso,
      usuarioDisponivel,
      criarTurma,
      atualizarTurma,
      removerTurma,
      moverAluno,
      atualizarAluno,
      desmatricularAluno,
      lerChamada,
      salvarChamada,
      lerPrograma,
      marcarItemPrograma,
      removerProfessor,
      criarAluno,
      criarProfessor,
      entrar,
      sair,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAcademia() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useAcademia precisa estar dentro de <AcademiaProvider>");
  }
  return contexto;
}
