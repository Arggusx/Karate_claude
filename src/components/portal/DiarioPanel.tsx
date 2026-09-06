"use client";

import { useEffect, useMemo, useState } from "react";
import { AlunoCampo, AlunoCard } from "@/components/portal/AlunoCard";
import { AlunoDetalheModal } from "@/components/portal/DetalheModal";
import { CampoBusca, paraBusca } from "@/components/portal/CampoBusca";
import { Badge, BeltBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Paginacao } from "@/components/ui/Paginacao";
import { useToast } from "@/components/ui/Toast";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { useAcademia } from "@/lib/academiaStore";
import type { Aluno, Chamada } from "@/types";

const POR_PAGINA = 10;

/**
 * Diário de classe: uma única tabela com todos os alunos, distinguidos pela
 * coluna de turma, com busca, filtro de turma e paginação. A chamada começa
 * vazia — quem não for marcado é falta.
 */
export function DiarioPanel() {
  const { turmas, alunos, lerChamada, salvarChamada } = useAcademia();
  const toast = useToast();
  const [chamada, setChamada] = useState<Chamada>({});
  const [salva, setSalva] = useState<string | null>(null);
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [turmaFiltro, setTurmaFiltro] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const [emDetalhe, setEmDetalhe] = useState<Aluno | null>(null);

  const nomeDaTurma = useMemo(
    () => new Map(turmas.map((turma) => [turma.id, turma.nome])),
    [turmas],
  );

  // Agrupa por turma e ordena por nome, sem quebrar a tabela em duas.
  const filtrados = useMemo(() => {
    const alvo = paraBusca(busca.trim());

    return alunos
      .filter((aluno) => {
        const naTurma =
          turmaFiltro === "todas" || aluno.turmaId === turmaFiltro;
        const combina =
          !alvo ||
          paraBusca(aluno.nome).includes(alvo) ||
          paraBusca(aluno.usuario).includes(alvo);
        return naTurma && combina;
      })
      .sort((a, b) => {
        const turmaA = nomeDaTurma.get(a.turmaId) ?? "";
        const turmaB = nomeDaTurma.get(b.turmaId) ?? "";
        return turmaA.localeCompare(turmaB) || a.nome.localeCompare(b.nome);
      });
  }, [alunos, busca, turmaFiltro, nomeDaTurma]);

  // Qualquer filtro novo volta para a primeira página.
  useEffect(() => setPagina(1), [busca, turmaFiltro]);

  const visiveis = filtrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  // A contagem considera o recorte filtrado, que é o que será salvo.
  const presentes = filtrados.filter((aluno) => chamada[aluno.id]).length;

  function alternar(alunoId: string) {
    setChamada((atual) => ({ ...atual, [alunoId]: !atual[alunoId] }));
  }

  // A aula existe por turma e data: sem uma turma escolhida não há o que gravar.
  const turmaEscolhida = turmaFiltro !== "todas";

  // Abre a chamada já gravada daquele dia, para corrigir em vez de recomeçar.
  useEffect(() => {
    if (!turmaEscolhida) {
      setChamada({});
      return;
    }

    let valido = true;
    lerChamada(turmaFiltro, data).then((gravada) => {
      if (valido) setChamada(gravada);
    });
    return () => {
      valido = false;
    };
  }, [turmaEscolhida, turmaFiltro, data, lerChamada]);

  async function salvar() {
    setSalvando(true);
    const resultado = await salvarChamada(
      turmaFiltro,
      data,
      chamada,
      filtrados.map((aluno) => aluno.id),
    );
    setSalvando(false);

    if (!resultado.ok) {
      toast(resultado.erro ?? "Não foi possível salvar a chamada.", "erro");
      return;
    }

    setSalva(
      `${presentes} presenças e ${filtrados.length - presentes} faltas gravadas em ${data
        .split("-")
        .reverse()
        .join("/")}.`,
    );
    toast("Chamada salva.");
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Nenhum aluno vem marcado: o padrão da chamada é{" "}
        <span className="font-medium text-status-bad">falta</span>. Marque quem
        esteve presente antes de salvar.
        {!turmaEscolhida ? (
          <>
            {" "}
            <span className="text-status-bad">
              Escolha uma turma para gravar — a chamada é por turma e data.
            </span>
          </>
        ) : null}
      </p>

      {/* Filtros */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CampoBusca
            id="busca-diario"
            valor={busca}
            onChange={setBusca}
            className="sm:w-64"
          />
          <select
            aria-label="Filtrar por turma"
            className="input sm:w-44"
            value={turmaFiltro}
            onChange={(event) => setTurmaFiltro(event.target.value)}
          >
            <option value="todas">Todas as turmas</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="diario-data" className="label">
            Data da aula
          </label>
          <input
            id="diario-data"
            type="date"
            className="input mt-1"
            value={data}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(evento) => setData(evento.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xs tabular-nums text-subtle">
            {presentes} presentes · {filtrados.length - presentes} faltas
          </span>
          <Button
            size="sm"
            disabled={filtrados.length === 0 || !turmaEscolhida || salvando}
            onClick={salvar}
          >
            {salvando ? "Salvando…" : "Salvar chamada"}
          </Button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="card px-4 py-6 text-center">
          <p className="text-xs text-muted">
            Nenhum aluno encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: um card por aluno, expansível */}
          <div className="space-y-2 sm:hidden">
            {visiveis.map((aluno) => (
              <AlunoCard
                key={aluno.id}
                aluno={aluno}
                onDetalhe={() => setEmDetalhe(aluno)}
                acao={
                  <BotaoPresenca
                    presente={Boolean(chamada[aluno.id])}
                    onClick={() => alternar(aluno.id)}
                  />
                }
              >
                <AlunoCampo rotulo="Turma">
                  <Badge>{nomeDaTurma.get(aluno.turmaId) ?? "—"}</Badge>
                </AlunoCampo>
                <AlunoCampo rotulo="Usuário">
                  <span className="font-mono">{aluno.usuario}</span>
                </AlunoCampo>
                <AlunoCampo rotulo="Idade">{aluno.idade} anos</AlunoCampo>
                <AlunoCampo rotulo="Faixa">
                  <BeltBadge cor={aluno.corFaixa}>{aluno.faixa}</BeltBadge>
                </AlunoCampo>
                <AlunoCampo rotulo="Frequência">
                  <span className="tabular-nums">{aluno.frequencia}%</span>
                </AlunoCampo>
                <AlunoCampo rotulo="Pagamento">
                  <StatusBadge status={aluno.status} />
                </AlunoCampo>
              </AlunoCard>
            ))}
          </div>

          {/* Desktop: tabela completa */}
          <div className="hidden sm:block">
            <Table minWidth="min-w-[820px]">
              <THead>
                <TR>
                  <TH>Aluno</TH>
                  <TH>Turma</TH>
                  <TH>Faixa</TH>
                  <TH className="text-right">Frequência</TH>
                  <TH>Pagamento</TH>
                  <TH>Presença</TH>
                </TR>
              </THead>
              <TBody>
                {visiveis.map((aluno) => (
                  <TR key={aluno.id}>
                    <TD>
                      <button
                        type="button"
                        onClick={() => setEmDetalhe(aluno)}
                        className="flex items-center gap-2.5 text-left"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded border border-line bg-elevated text-2xs font-medium text-fg">
                          {aluno.foto}
                        </span>
                        <span>
                          <span className="block font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-accent">
                            {aluno.nome}
                          </span>
                          <span className="block text-2xs text-subtle">
                            {aluno.idade} anos · {aluno.usuario}
                          </span>
                        </span>
                      </button>
                    </TD>
                    <TD>
                      <Badge>{nomeDaTurma.get(aluno.turmaId) ?? "—"}</Badge>
                    </TD>
                    <TD>
                      <BeltBadge cor={aluno.corFaixa}>{aluno.faixa}</BeltBadge>
                    </TD>
                    <TD className="text-right tabular-nums">
                      {aluno.frequencia}%
                    </TD>
                    <TD>
                      <StatusBadge status={aluno.status} />
                    </TD>
                    <TD>
                      <BotaoPresenca
                        presente={Boolean(chamada[aluno.id])}
                        onClick={() => alternar(aluno.id)}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          <Paginacao
            total={filtrados.length}
            pagina={pagina}
            porPagina={POR_PAGINA}
            onPagina={setPagina}
            rotulo="alunos"
          />

          <AlunoDetalheModal
            aluno={emDetalhe}
            onClose={() => setEmDetalhe(null)}
          />
        </>
      )}

      <Modal
        open={salva !== null}
        onClose={() => setSalva(null)}
        titulo="Chamada registrada"
      >
        <p className="text-sm text-muted">{salva}</p>
        <Button size="sm" className="mt-4" onClick={() => setSalva(null)}>
          Fechar
        </Button>
      </Modal>
    </div>
  );
}

/** Alterna presença/falta — usado na tabela e no card mobile. */
function BotaoPresenca({
  presente,
  onClick,
}: {
  presente: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={presente}
      className={`rounded-md border px-2.5 py-1 text-2xs font-medium transition-colors ${
        presente
          ? "border-status-ok/40 bg-status-ok/10 text-status-ok"
          : "border-status-bad/40 bg-status-bad/10 text-status-bad"
      }`}
    >
      {presente ? "Presente" : "Falta"}
    </button>
  );
}
