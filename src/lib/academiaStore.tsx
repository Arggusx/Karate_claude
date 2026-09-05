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
  ADMIN,
  ALUNOS_INICIAIS,
  PROFESSORES,
  TURMAS_INICIAIS,
  formatarNome,
  normalizarUsuario,
} from "@/services/dataService";
import type { Aluno, AulaPlano, Professor, Sessao, Turma } from "@/types";

/**
 * Estado da academia (turmas, alunos, professores) e da sessão. Vive em
 * memória e é espelhado no localStorage para que um cadastro feito agora
 * consiga entrar no portal em seguida. Quando existir back-end, cada ação
 * vira uma chamada de API mantendo a mesma assinatura.
 *
 * As senhas ficam em texto puro porque este é um protótipo de front-end sem
 * servidor — no back-end elas devem ser guardadas apenas como hash.
 */

const CHAVE = "portal-shotokan:academia";

interface ResultadoLogin {
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
  alunosDaTurma: (turmaId: string) => Aluno[];
  professorDaTurma: (turmaId: string) => Professor | undefined;
  usuarioEmUso: (usuario: string, ignorarId?: string) => boolean;
  usuarioDisponivel: (base: string) => string;
  criarTurma: (turma: Omit<Turma, "id" | "plano"> & { plano?: AulaPlano[] }) => void;
  atualizarTurma: (id: string, mudancas: Partial<Turma>) => void;
  removerTurma: (id: string) => void;
  moverAluno: (alunoId: string, turmaId: string) => void;
  criarAluno: (aluno: Omit<Aluno, "id" | "foto">) => ResultadoLogin;
  criarProfessor: (professor: Omit<Professor, "id" | "foto">) => ResultadoLogin;
  entrar: (usuario: string, senha: string) => ResultadoLogin;
  sair: () => void;
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

interface Persistido {
  turmas: Turma[];
  alunos: Aluno[];
  professores: Professor[];
  sessao: Sessao | null;
}

export function AcademiaProvider({ children }: { children: ReactNode }) {
  const [turmas, setTurmas] = useState<Turma[]>(TURMAS_INICIAIS);
  const [alunos, setAlunos] = useState<Aluno[]>(ALUNOS_INICIAIS);
  const [professores, setProfessores] = useState<Professor[]>(PROFESSORES);
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregado, setCarregado] = useState(false);

  // Hidrata a partir do navegador só depois da montagem, para não divergir
  // do HTML renderizado no servidor.
  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) {
        const salvo = JSON.parse(bruto) as Partial<Persistido>;
        if (salvo.turmas?.length) setTurmas(salvo.turmas);
        if (salvo.alunos?.length) setAlunos(salvo.alunos);
        if (salvo.professores?.length) setProfessores(salvo.professores);
        setSessao(salvo.sessao ?? null);
      }
    } catch {
      // localStorage indisponível: segue com os dados iniciais.
    }
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      window.localStorage.setItem(
        CHAVE,
        JSON.stringify({ turmas, alunos, professores, sessao }),
      );
    } catch {
      // Sem persistência: o estado continua válido durante a sessão.
    }
  }, [carregado, turmas, alunos, professores, sessao]);

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

  /** Um nome de usuário vale para todo o dojo: alunos, professores e admin. */
  const usuarioEmUso = useCallback(
    (usuario: string, ignorarId?: string) => {
      const alvo = normalizarUsuario(usuario);
      if (!alvo) return false;
      if (alvo === ADMIN.usuario) return true;
      return (
        alunos.some(
          (aluno) => aluno.usuario === alvo && aluno.id !== ignorarId,
        ) ||
        professores.some(
          (professor) =>
            professor.usuario === alvo && professor.id !== ignorarId,
        )
      );
    },
    [alunos, professores],
  );

  /** Devolve o nome livre mais próximo da base ("ana.silva2", "ana.silva3"...). */
  const usuarioDisponivel = useCallback(
    (base: string) => {
      const raiz = normalizarUsuario(base);
      if (!raiz) return "";
      if (!usuarioEmUso(raiz)) return raiz;
      let sufixo = 2;
      while (usuarioEmUso(`${raiz}${sufixo}`)) sufixo += 1;
      return `${raiz}${sufixo}`;
    },
    [usuarioEmUso],
  );

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
    (alunoId, turmaId) => {
      setAlunos((atual) =>
        atual.map((aluno) =>
          aluno.id === alunoId ? { ...aluno, turmaId } : aluno,
        ),
      );
    },
    [],
  );

  const criarAluno = useCallback<AcademiaContexto["criarAluno"]>(
    (aluno) => {
      const usuario = normalizarUsuario(aluno.usuario);
      if (!usuario) return { ok: false, erro: "Informe um nome de usuário." };
      if (usuario.length < 3) {
        return { ok: false, erro: "O nome de usuário precisa ter ao menos 3 caracteres." };
      }
      if (aluno.senha.length < 6) {
        return { ok: false, erro: "A senha precisa ter ao menos 6 caracteres." };
      }
      if (usuarioEmUso(usuario)) {
        return { ok: false, erro: `O usuário "${usuario}" já está em uso.` };
      }

      const nome = formatarNome(aluno.nome);
      setAlunos((atual) => [
        ...atual,
        { ...aluno, nome, usuario, id: `a-${Date.now()}`, foto: iniciais(nome) },
      ]);
      return { ok: true };
    },
    [usuarioEmUso],
  );

  const criarProfessor = useCallback<AcademiaContexto["criarProfessor"]>(
    (professor) => {
      const usuario = normalizarUsuario(professor.usuario);
      if (!usuario) return { ok: false, erro: "Informe um nome de usuário." };
      if (usuario.length < 3) {
        return { ok: false, erro: "O nome de usuário precisa ter ao menos 3 caracteres." };
      }
      if (professor.senha.length < 6) {
        return { ok: false, erro: "A senha precisa ter ao menos 6 caracteres." };
      }
      if (usuarioEmUso(usuario)) {
        return { ok: false, erro: `O usuário "${usuario}" já está em uso.` };
      }

      const nome = formatarNome(professor.nome);
      setProfessores((atual) => [
        ...atual,
        {
          ...professor,
          nome,
          usuario,
          id: `p-${Date.now()}`,
          foto: iniciais(nome),
        },
      ]);
      return { ok: true };
    },
    [usuarioEmUso],
  );

  const entrar = useCallback<AcademiaContexto["entrar"]>(
    (usuarioInformado, senha) => {
      const usuario = normalizarUsuario(usuarioInformado);

      if (usuario === ADMIN.usuario) {
        if (senha !== ADMIN.senha) {
          return { ok: false, erro: "Usuário ou senha inválidos." };
        }
        const nova: Sessao = {
          perfil: "admin",
          id: ADMIN.id,
          nome: ADMIN.nome,
          usuario: ADMIN.usuario,
        };
        setSessao(nova);
        return { ok: true, sessao: nova };
      }

      const professor = professores.find((item) => item.usuario === usuario);
      if (professor) {
        if (professor.senha !== senha) {
          return { ok: false, erro: "Usuário ou senha inválidos." };
        }
        const nova: Sessao = {
          perfil: "professor",
          id: professor.id,
          nome: professor.nome,
          usuario: professor.usuario,
        };
        setSessao(nova);
        return { ok: true, sessao: nova };
      }

      const aluno = alunos.find((item) => item.usuario === usuario);
      if (aluno) {
        if (aluno.senha !== senha) {
          return { ok: false, erro: "Usuário ou senha inválidos." };
        }
        const nova: Sessao = {
          perfil: "aluno",
          id: aluno.id,
          nome: aluno.nome,
          usuario: aluno.usuario,
        };
        setSessao(nova);
        return { ok: true, sessao: nova };
      }

      return { ok: false, erro: "Usuário ou senha inválidos." };
    },
    [alunos, professores],
  );

  const sair = useCallback(() => setSessao(null), []);

  const valor = useMemo(
    () => ({
      carregado,
      turmas,
      alunos,
      professores,
      sessao,
      alunosDaTurma,
      professorDaTurma,
      usuarioEmUso,
      usuarioDisponivel,
      criarTurma,
      atualizarTurma,
      removerTurma,
      moverAluno,
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
      alunosDaTurma,
      professorDaTurma,
      usuarioEmUso,
      usuarioDisponivel,
      criarTurma,
      atualizarTurma,
      removerTurma,
      moverAluno,
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
