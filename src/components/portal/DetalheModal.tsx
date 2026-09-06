"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SeletorTurma } from "@/components/portal/SeletorTurma";
import { Badge, BeltBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAcademia } from "@/lib/academiaStore";
import { cn } from "@/lib/cn";
import {
  FREQUENCIA_ALVO,
  FREQUENCIA_MINIMA,
  PESOS_PROGRESSO,
  getGraduacoes,
  graduacaoDaFaixa,
  horarioDaTurma,
  idadePorNascimento,
} from "@/services/dataService";
import type { Aluno, CriterioProgresso, Professor } from "@/types";

const GRADUACOES = getGraduacoes();

/** Linha rótulo / valor das fichas. */
function Campo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <dt className="text-2xs uppercase tracking-[0.08em] text-muted">
        {rotulo}
      </dt>
      <dd className="text-right text-xs text-fg">{children}</dd>
    </div>
  );
}

/** Cabeçalho com iniciais, nome e usuário. */
function Identificacao({
  foto,
  nome,
  usuario,
  etiqueta,
}: {
  foto: string;
  nome: string;
  usuario: string;
  etiqueta?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded border border-line bg-elevated text-xs font-medium text-fg">
          {foto}
        </span>
        <div>
          <p className="text-sm font-medium text-fg">{nome}</p>
          <p className="font-mono text-2xs text-subtle">{usuario}</p>
        </div>
      </div>
      {etiqueta}
    </div>
  );
}

/**
 * Bloco de remoção em duas etapas: o primeiro clique só arma a confirmação.
 * Fica separado do resto por uma borda para não ser clicado sem intenção.
 */
function ZonaDeRisco({
  titulo,
  aviso,
  rotuloAcao,
  onConfirmar,
}: {
  titulo: string;
  aviso: string;
  rotuloAcao: string;
  onConfirmar: () => Promise<void>;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!confirmando) {
    return (
      <div className="mt-4 border-t border-line pt-3">
        <Button
          size="sm"
          variant="ghost"
          className="text-status-bad"
          onClick={() => setConfirmando(true)}
        >
          {rotuloAcao}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-md border border-status-bad/40 bg-status-bad/10 p-3">
      <p className="text-xs font-medium text-fg">{titulo}</p>
      <p className="mt-1 text-2xs leading-relaxed text-muted">{aviso}</p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          disabled={enviando}
          onClick={async () => {
            setEnviando(true);
            await onConfirmar();
            setEnviando(false);
          }}
        >
          {enviando ? "Removendo…" : "Confirmar"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={enviando}
          onClick={() => setConfirmando(false)}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}

/** Barra e legenda de um dos critérios do exame. */
function LinhaCriterio({
  rotulo,
  peso,
  criterio,
}: {
  rotulo: string;
  peso: number;
  criterio: CriterioProgresso;
}) {
  return (
    <div className="px-3 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-fg">
          {rotulo}
          <span className="ml-1 text-2xs text-subtle">
            peso {Math.round(peso * 100)}%
          </span>
        </span>
        <span className="text-xs font-medium tabular-nums text-fg">
          {criterio.percentual}%
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-elevated">
        <div
          className={cn(
            "h-full rounded-full",
            criterio.percentual >= 100 ? "bg-status-ok" : "bg-accent",
          )}
          style={{ width: `${criterio.percentual}%` }}
        />
      </div>
      <p className="mt-1 text-2xs text-muted">{criterio.detalhe}</p>
    </div>
  );
}

/**
 * Checklist do programa técnico da faixa. Marcar um item é avaliação do
 * professor — é o único critério que não sai de contagem automática.
 */
function ProgramaDaFaixa({ aluno }: { aluno: Aluno }) {
  const { lerPrograma, marcarItemPrograma } = useAcademia();
  const [concluidos, setConcluidos] = useState<Set<string>>(new Set());
  const [carregando, setCarregando] = useState(true);

  const graduacao = graduacaoDaFaixa(aluno.faixa);

  const itens = [
    ...(graduacao?.katasExigidos ?? []).map((item) => ({
      tipo: "kata" as const,
      item,
    })),
    ...(graduacao?.kihonExigido ?? []).map((item) => ({
      tipo: "kihon" as const,
      item,
    })),
  ];

  useEffect(() => {
    let valido = true;
    setCarregando(true);
    lerPrograma(aluno.id).then((lista) => {
      if (!valido) return;
      setConcluidos(new Set(lista.map((l) => `${l.tipo}:${l.item}`)));
      setCarregando(false);
    });
    return () => {
      valido = false;
    };
  }, [aluno.id, aluno.faixa, lerPrograma]);

  if (itens.length === 0) {
    return (
      <p className="text-2xs text-subtle">
        O programa desta faixa ainda não está mapeado.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-md border border-line">
      {itens.map(({ tipo, item }) => {
        const chave = `${tipo}:${item}`;
        const marcado = concluidos.has(chave);

        return (
          <li key={chave}>
            <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2">
              <input
                type="checkbox"
                checked={marcado}
                disabled={carregando}
                onChange={async (evento) => {
                  const concluido = evento.target.checked;

                  // Otimista: a marcação responde na hora e volta se falhar.
                  setConcluidos((atual) => {
                    const proximo = new Set(atual);
                    if (concluido) proximo.add(chave);
                    else proximo.delete(chave);
                    return proximo;
                  });

                  const resultado = await marcarItemPrograma(aluno.id, {
                    tipo,
                    item,
                    concluido,
                  });

                  if (!resultado.ok) {
                    setConcluidos((atual) => {
                      const proximo = new Set(atual);
                      if (concluido) proximo.delete(chave);
                      else proximo.add(chave);
                      return proximo;
                    });
                  }
                }}
              />
              <span className="min-w-0 flex-1 text-xs text-fg">{item}</span>
              <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
                {tipo}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/** Ficha completa do aluno, aberta ao clicar nele em qualquer listagem. */
export function AlunoDetalheModal({
  aluno: alunoAberto,
  onClose,
}: {
  aluno: Aluno | null;
  onClose: () => void;
}) {
  const {
    alunos,
    turmas,
    sessao,
    atualizarAluno,
    desmatricularAluno,
  } = useAcademia();
  const toast = useToast();
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [faixaId, setFaixaId] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Trocar de aluno não deve herdar o estado do anterior.
  useEffect(() => {
    setErro(null);
    setEditando(false);
  }, [alunoAberto?.id]);

  // Quem abriu o modal passou uma cópia; o que vale é a versão viva do store,
  // senão marcar um item do programa não mexe nos percentuais em tela.
  const aluno =
    alunos.find((item) => item.id === alunoAberto?.id) ?? alunoAberto;

  if (!aluno) return null;

  const turma = turmas.find((item) => item.id === aluno.turmaId);
  const equipe = sessao?.perfil === "professor" || sessao?.perfil === "admin";
  const ehPropriaConta = sessao?.id === aluno.id;

  return (
    <Modal open onClose={onClose} titulo="Ficha do aluno">
      <div className="space-y-4">
        <Identificacao
          foto={aluno.foto}
          nome={aluno.nome}
          usuario={aluno.usuario}
          etiqueta={<StatusBadge status={aluno.status} />}
        />

        <dl className="divide-y divide-line rounded-md border border-line">
          <Campo rotulo="Idade">
            {aluno.dataNascimento
              ? `${aluno.idade} anos`
              : `${aluno.idade} anos · sem data de nascimento`}
          </Campo>
          <Campo rotulo="Faixa">
            <BeltBadge cor={aluno.corFaixa}>{aluno.faixa}</BeltBadge>
          </Campo>
          <Campo rotulo="Turma">
            {turma ? (
              <span>
                {turma.nome}
                <span className="block text-2xs text-subtle">
                  {horarioDaTurma(turma)}
                </span>
              </span>
            ) : (
              <span className="text-subtle">Sem turma</span>
            )}
          </Campo>
          <Campo rotulo="Frequência">
            <span
              className={cn(
                "tabular-nums",
                aluno.frequencia < FREQUENCIA_MINIMA && "text-status-bad",
              )}
            >
              {aluno.frequencia}%
            </span>
            <span className="block text-2xs text-subtle">
              mínimo {FREQUENCIA_MINIMA}% · meta {FREQUENCIA_ALVO}%
            </span>
          </Campo>
          <Campo rotulo="Próximo exame">{aluno.proximoExame}</Campo>
        </dl>

        <div>
          <div className="flex items-baseline justify-between">
            <p className="label">Progresso para o exame</p>
            <span className="text-sm font-semibold tabular-nums text-fg">
              {aluno.progresso}%
            </span>
          </div>

          {aluno.criterios ? (
            <div className="mt-1 divide-y divide-line rounded-md border border-line">
              <LinhaCriterio
                rotulo="Programa técnico"
                peso={PESOS_PROGRESSO.tecnica}
                criterio={aluno.criterios.tecnica}
              />
              <LinhaCriterio
                rotulo="Tempo na faixa"
                peso={PESOS_PROGRESSO.tempo}
                criterio={aluno.criterios.tempo}
              />
              <LinhaCriterio
                rotulo="Aulas assistidas"
                peso={PESOS_PROGRESSO.aulas}
                criterio={aluno.criterios.aulas}
              />
              <LinhaCriterio
                rotulo="Mensalidade"
                peso={PESOS_PROGRESSO.financeiro}
                criterio={aluno.criterios.financeiro}
              />
            </div>
          ) : (
            <p className="mt-1 text-2xs text-subtle">Calculando…</p>
          )}

          <p className="mt-2 text-2xs text-muted">
            {aluno.aptoParaExame
              ? "Todos os critérios cumpridos — apto a prestar exame."
              : "O exame exige os quatro critérios completos e a frequência acima do mínimo."}
          </p>
        </div>

        {equipe ? (
          <div>
            <p className="label">Programa da faixa atual</p>
            <p className="mb-1 mt-0.5 text-2xs text-subtle">
              Marque o que o aluno já domina. É isto que move o critério de
              maior peso.
            </p>
            <ProgramaDaFaixa aluno={aluno} />
          </div>
        ) : null}

        {equipe ? (
          <div>
            <p className="label">Mudar de turma</p>
            <div className="mt-1">
              <SeletorTurma aluno={aluno} />
            </div>
          </div>
        ) : null}

        {equipe && !editando ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const atual = GRADUACOES.find(
                (item) => `${item.faixa} · ${item.grau}` === aluno.faixa,
              );
              setFaixaId(atual?.id ?? GRADUACOES[0]?.id ?? "");
              setNascimento(aluno.dataNascimento);
              setEditando(true);
            }}
          >
            Editar dados
          </Button>
        ) : null}

        {equipe && editando ? (
          <div className="rounded-md border border-line p-3">
            <div>
              <label htmlFor="ficha-faixa" className="label">
                Faixa
              </label>
              <select
                id="ficha-faixa"
                className="input mt-1"
                value={faixaId}
                onChange={(evento) => setFaixaId(evento.target.value)}
              >
                {GRADUACOES.map((graduacao) => (
                  <option key={graduacao.id} value={graduacao.id}>
                    {graduacao.faixa} · {graduacao.grau}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3">
              <label htmlFor="ficha-nascimento" className="label">
                Data de nascimento
              </label>
              <input
                id="ficha-nascimento"
                type="date"
                className="input mt-1"
                value={nascimento}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(evento) => setNascimento(evento.target.value)}
              />
              <p className="mt-1 text-2xs text-subtle">
                {idadePorNascimento(nascimento) !== null
                  ? `${idadePorNascimento(nascimento)} anos — a idade passa a ser calculada daqui.`
                  : "Preencha para a idade passar a ser calculada sozinha."}
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                disabled={salvando}
                onClick={async () => {
                  const graduacao = GRADUACOES.find(
                    (item) => item.id === faixaId,
                  );
                  if (!graduacao) return;

                  setSalvando(true);
                  const resultado = await atualizarAluno(aluno.id, {
                    faixa: `${graduacao.faixa} · ${graduacao.grau}`,
                    dataNascimento: nascimento || null,
                  });
                  setSalvando(false);

                  if (!resultado.ok) {
                    setErro(resultado.erro ?? "Não foi possível salvar.");
                    return;
                  }
                  toast(`Dados de ${aluno.nome} atualizados.`);
                  setEditando(false);
                }}
              >
                {salvando ? "Salvando…" : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={salvando}
                onClick={() => setEditando(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}

        {erro ? (
          <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad">
            {erro}
          </p>
        ) : null}

        {equipe && !ehPropriaConta ? (
          <ZonaDeRisco
            rotuloAcao="Desmatricular aluno"
            titulo={`Desmatricular ${aluno.nome}?`}
            aviso="A conta é desativada e some das listagens e da chamada. As mensalidades já registradas continuam no histórico financeiro."
            onConfirmar={async () => {
              const resultado = await desmatricularAluno(aluno.id);
              if (!resultado.ok) {
                setErro(resultado.erro ?? "Não foi possível desmatricular.");
                return;
              }
              toast(`${aluno.nome} foi desmatriculado.`);
              onClose();
            }}
          />
        ) : null}
      </div>
    </Modal>
  );
}

/** Ficha do professor, com as turmas sob responsabilidade dele. */
export function ProfessorDetalheModal({
  professor: professorAberto,
  onClose,
}: {
  professor: Professor | null;
  onClose: () => void;
}) {
  const { professores, turmas, alunosDaTurma, sessao, removerProfessor } =
    useAcademia();
  const toast = useToast();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => setErro(null), [professorAberto?.id]);

  const professor =
    professores.find((item) => item.id === professorAberto?.id) ??
    professorAberto;

  if (!professor) return null;

  const doProfessor = turmas.filter(
    (turma) => turma.professorId === professor.id,
  );
  const totalAlunos = doProfessor.reduce(
    (total, turma) => total + alunosDaTurma(turma.id).length,
    0,
  );
  const ehPropriaConta = sessao?.id === professor.id;

  return (
    <Modal open onClose={onClose} titulo="Ficha do professor">
      <div className="space-y-4">
        <Identificacao
          foto={professor.foto}
          nome={professor.nome}
          usuario={professor.usuario}
          etiqueta={<Badge tone="accent">{professor.graduacao}</Badge>}
        />

        <dl className="divide-y divide-line rounded-md border border-line">
          <Campo rotulo="E-mail">{professor.email}</Campo>
          <Campo rotulo="No dojo desde">{professor.desde}</Campo>
          <Campo rotulo="Turmas">
            <span className="tabular-nums">{doProfessor.length}</span>
          </Campo>
          <Campo rotulo="Alunos">
            <span className="tabular-nums">{totalAlunos}</span>
          </Campo>
        </dl>

        {doProfessor.length > 0 ? (
          <div>
            <p className="label">Turmas sob responsabilidade</p>
            <ul className="mt-1 divide-y divide-line rounded-md border border-line">
              {doProfessor.map((turma) => (
                <li
                  key={turma.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <span>
                    <span className="block text-xs font-medium text-fg">
                      Turma {turma.nome}
                    </span>
                    <span className="block text-2xs text-muted">
                      {horarioDaTurma(turma)}
                    </span>
                  </span>
                  <span className="text-2xs tabular-nums text-subtle">
                    {alunosDaTurma(turma.id).length} alunos
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {erro ? (
          <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad">
            {erro}
          </p>
        ) : null}

        {sessao?.perfil === "admin" && !ehPropriaConta ? (
          <ZonaDeRisco
            rotuloAcao="Desativar professor"
            titulo={`Desativar ${professor.nome}?`}
            aviso={
              doProfessor.length > 0
                ? `A conta perde o acesso ao portal e as ${doProfessor.length} turmas dele ficam sem professor até serem reatribuídas.`
                : "A conta perde o acesso ao portal. O histórico registrado em nome dele é preservado."
            }
            onConfirmar={async () => {
              const resultado = await removerProfessor(professor.id);
              if (!resultado.ok) {
                setErro(resultado.erro ?? "Não foi possível desativar.");
                return;
              }
              toast(`${professor.nome} foi desativado.`);
              onClose();
            }}
          />
        ) : null}
      </div>
    </Modal>
  );
}
