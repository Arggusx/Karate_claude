"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CampoBusca, paraBusca } from "@/components/portal/CampoBusca";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Paginacao } from "@/components/ui/Paginacao";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";

const POR_PAGINA = 10;

const FORMAS = [
  { valor: "dinheiro", label: "Dinheiro (espécie)" },
  { valor: "pix_presencial", label: "PIX direto ao professor/admin" },
  { valor: "transferencia", label: "Transferência / depósito" },
];

const ROTULO_FORMA: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix_presencial: "PIX presencial",
  transferencia: "Transferência",
  pix: "PIX (portal)",
  credit_card: "Cartão (portal)",
  stripe: "Cartão (portal)",
};

interface LinhaSituacao {
  aluno_id: number;
  nome: string;
  usuario: string | null;
  financial_status: "ativo" | "pendente" | "atrasado";
  em_aberto: number;
  total_aberto_centavos: number;
  competencia_mais_antiga: string | null;
}

interface Cobranca {
  id: number;
  competencia: string;
  valor_centavos: number;
  vencimento: string;
  status: string;
  pago_em: string | null;
  payment_method: string | null;
  observacao: string | null;
  provedor?: string | null;
}

/**
 * Painel financeiro do professor e do admin.
 *
 * O pagamento é voluntário: o aluno pode pagar em espécie, no PIX pessoal do
 * professor ou pelo portal. Esta tela é onde professor e admin dão baixa no
 * que foi recebido fora do sistema — e desfazem lançamentos errados.
 */
export function FinanceiroPanel() {
  const toast = useToast();

  const [linhas, setLinhas] = useState<LinhaSituacao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [alunoAberto, setAlunoAberto] = useState<LinhaSituacao | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const resposta = await fetch("/api/financeiro/overview", {
        cache: "no-store",
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha ao carregar.");
      setLinhas(dados.alunos);
    } catch (falha) {
      setErro(
        falha instanceof Error
          ? falha.message
          : "Não foi possível carregar o financeiro.",
      );
      setLinhas([]);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtradas = useMemo(() => {
    const alvo = paraBusca(busca.trim());
    if (!linhas) return [];
    if (!alvo) return linhas;
    return linhas.filter(
      (linha) =>
        paraBusca(linha.nome).includes(alvo) ||
        paraBusca(linha.usuario ?? "").includes(alvo),
    );
  }, [linhas, busca]);

  useEffect(() => setPagina(1), [busca]);

  const visiveis = filtradas.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  const totalAberto = filtradas.reduce(
    (soma, linha) => soma + linha.total_aberto_centavos,
    0,
  );

  if (linhas === null) return <SkeletonTable rows={6} />;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        O pagamento é voluntário: o aluno pode pagar em espécie, no PIX pessoal
        do professor ou pelo portal. Use “Dar baixa” para registrar o que foi
        recebido fora do sistema.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CampoBusca
          id="busca-financeiro"
          valor={busca}
          onChange={setBusca}
          className="sm:w-64"
        />
        <div className="flex items-center gap-3">
          <span className="text-2xs tabular-nums text-subtle">
            {filtradas.filter((l) => l.em_aberto > 0).length} com pendência ·
            R$ {(totalAberto / 100).toFixed(2).replace(".", ",")} em aberto
          </span>
          <Button size="sm" variant="secondary" onClick={carregar}>
            Atualizar
          </Button>
        </div>
      </div>

      {erro ? (
        <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad">
          {erro}
        </p>
      ) : null}

      {filtradas.length === 0 ? (
        <div className="card px-4 py-6 text-center">
          <p className="text-xs text-muted">
            Nenhum aluno encontrado. Os alunos precisam existir no banco
            (tabela <span className="font-mono">users</span>) para aparecer
            aqui.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden sm:block">
            <Table minWidth="min-w-[760px]">
              <THead>
                <TR>
                  <TH>Aluno</TH>
                  <TH>Situação</TH>
                  <TH className="text-right">Meses em aberto</TH>
                  <TH className="text-right">Total em aberto</TH>
                  <TH>Desde</TH>
                  <TH>Ações</TH>
                </TR>
              </THead>
              <TBody>
                {visiveis.map((linha) => (
                  <TR key={linha.aluno_id}>
                    <TD>
                      <span className="block font-medium text-fg">
                        {linha.nome}
                      </span>
                      <span className="block font-mono text-2xs text-subtle">
                        {linha.usuario}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge
                        status={
                          linha.em_aberto === 0 ? "ativo" : "pendente"
                        }
                      />
                    </TD>
                    <TD className="text-right tabular-nums">
                      {linha.em_aberto}
                    </TD>
                    <TD className="text-right tabular-nums">
                      R${" "}
                      {(linha.total_aberto_centavos / 100)
                        .toFixed(2)
                        .replace(".", ",")}
                    </TD>
                    <TD className="whitespace-nowrap text-muted">
                      {linha.competencia_mais_antiga
                        ? formatarCompetencia(linha.competencia_mais_antiga)
                        : "—"}
                    </TD>
                    <TD>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAlunoAberto(linha)}
                      >
                        Mensalidades
                      </Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>

          {/* Mobile: cartões */}
          <div className="space-y-2 sm:hidden">
            {visiveis.map((linha) => (
              <article key={linha.aluno_id} className="card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">
                      {linha.nome}
                    </p>
                    <p className="font-mono text-2xs text-subtle">
                      {linha.usuario}
                    </p>
                  </div>
                  <StatusBadge
                    status={linha.em_aberto === 0 ? "ativo" : "pendente"}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {linha.em_aberto} em aberto · R${" "}
                  {(linha.total_aberto_centavos / 100)
                    .toFixed(2)
                    .replace(".", ",")}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() => setAlunoAberto(linha)}
                >
                  Mensalidades
                </Button>
              </article>
            ))}
          </div>

          <Paginacao
            total={filtradas.length}
            pagina={pagina}
            porPagina={POR_PAGINA}
            onPagina={setPagina}
            rotulo="alunos"
          />
        </>
      )}

      {alunoAberto ? (
        <MensalidadesDoAluno
          aluno={alunoAberto}
          onClose={() => setAlunoAberto(null)}
          onMudou={() => {
            carregar();
            toast("Situação financeira atualizada.");
          }}
        />
      ) : null}
    </div>
  );
}

/** Lista de mensalidades do aluno com baixa e estorno. */
function MensalidadesDoAluno({
  aluno,
  onClose,
  onMudou,
}: {
  aluno: LinhaSituacao;
  onClose: () => void;
  onMudou: () => void;
}) {
  const toast = useToast();
  const [cobrancas, setCobrancas] = useState<Cobranca[] | null>(null);
  const [baixando, setBaixando] = useState<Cobranca | null>(null);
  const [forma, setForma] = useState(FORMAS[0].valor);
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const resposta = await fetch(
      `/api/students/${aluno.usuario}/payments`,
      { cache: "no-store" },
    );
    const dados = await resposta.json();
    setCobrancas(resposta.ok ? dados.cobrancas : []);
  }, [aluno.usuario]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function confirmarBaixa() {
    if (!baixando) return;
    setEnviando(true);
    setErro(null);

    try {
      const resposta = await fetch(`/api/payments/${baixando.id}/baixa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forma, observacao }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha ao dar baixa.");

      toast(
        `Baixa registrada por ${dados.lancado_por} — ${ROTULO_FORMA[forma]}.`,
      );
      setBaixando(null);
      setObservacao("");
      await carregar();
      onMudou();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Falha ao dar baixa.");
    } finally {
      setEnviando(false);
    }
  }

  async function estornar(cobranca: Cobranca) {
    try {
      const resposta = await fetch(`/api/payments/${cobranca.id}/estorno`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: "Estorno pelo portal" }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro ?? "Falha ao estornar.");

      toast("Baixa estornada. A mensalidade voltou a ficar em aberto.");
      await carregar();
      onMudou();
    } catch (falha) {
      toast(
        falha instanceof Error ? falha.message : "Falha ao estornar.",
        "erro",
      );
    }
  }

  return (
    <Modal open onClose={onClose} titulo={`Mensalidades — ${aluno.nome}`}>
      {cobrancas === null ? (
        <SkeletonTable rows={4} />
      ) : cobrancas.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhuma mensalidade registrada para este aluno.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {cobrancas.map((cobranca) => {
            const paga =
              cobranca.status === "approved" || cobranca.status === "paga";
            const manual = cobranca.provedor === "manual";

            return (
              <li key={cobranca.id} className="flex flex-wrap gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-fg">
                      {formatarCompetencia(cobranca.competencia)}
                    </span>
                    <span className="text-xs tabular-nums text-muted">
                      R${" "}
                      {(cobranca.valor_centavos / 100)
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                    {paga ? (
                      <Badge tone="ok">Pago</Badge>
                    ) : (
                      <Badge tone="warn">Em aberto</Badge>
                    )}
                    {cobranca.payment_method ? (
                      <Badge>
                        {ROTULO_FORMA[cobranca.payment_method] ??
                          cobranca.payment_method}
                      </Badge>
                    ) : null}
                  </div>
                  {cobranca.observacao ? (
                    <p className="mt-0.5 text-2xs text-subtle">
                      {cobranca.observacao}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0">
                  {paga ? (
                    manual ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => estornar(cobranca)}
                      >
                        Estornar
                      </Button>
                    ) : (
                      <span className="text-2xs text-subtle">
                        pago no portal
                      </span>
                    )
                  ) : (
                    <Button size="sm" onClick={() => setBaixando(cobranca)}>
                      Dar baixa
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {baixando ? (
        <div className="mt-4 space-y-3 rounded-md border border-line bg-canvas p-3">
          <p className="text-xs font-medium text-fg">
            Baixa de {formatarCompetencia(baixando.competencia)} — R${" "}
            {(baixando.valor_centavos / 100).toFixed(2).replace(".", ",")}
          </p>

          <div>
            <label htmlFor="forma-baixa" className="label">
              Como foi recebido
            </label>
            <select
              id="forma-baixa"
              className="input mt-1"
              value={forma}
              onChange={(evento) => setForma(evento.target.value)}
            >
              {FORMAS.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="obs-baixa" className="label">
              Observação (opcional)
            </label>
            <input
              id="obs-baixa"
              className="input mt-1"
              value={observacao}
              onChange={(evento) => setObservacao(evento.target.value)}
              placeholder="Ex.: pago na aula de terça"
            />
          </div>

          {erro ? (
            <p className="text-2xs text-status-bad">{erro}</p>
          ) : (
            <p className="text-2xs text-subtle">
              Fica registrado quem lançou, quando e como — e dá para estornar.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setBaixando(null)}
            >
              Cancelar
            </Button>
            <Button size="sm" disabled={enviando} onClick={confirmarBaixa}>
              {enviando ? "Registrando…" : "Confirmar baixa"}
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function formatarCompetencia(data: string): string {
  const [ano, mes] = data.slice(0, 7).split("-");
  const meses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  return `${meses[Number(mes) - 1]}/${ano}`;
}
