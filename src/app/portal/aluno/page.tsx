"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, BeltBadge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckoutModal } from "@/components/portal/CheckoutModal";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { useAcademia } from "@/lib/academiaStore";
import {
  formatarReais,
  getGraduacoes,
  horarioDaTurma,
} from "@/services/dataService";

const GRADUACOES = getGraduacoes();

/** Descobre o programa de exame a partir da faixa do aluno ("Verde · 3º Kyu"). */
function programaDaFaixa(faixa: string) {
  return GRADUACOES.find((graduacao) =>
    faixa.toLowerCase().includes(graduacao.faixa.toLowerCase()),
  );
}

export default function PortalAlunoPage() {
  return (
    <GuardaPortal perfis={["aluno"]}>
      <ConteudoAluno />
    </GuardaPortal>
  );
}

function ConteudoAluno() {
  const { turmas, alunos, sessao, mensalidadeCentavos } = useAcademia();
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  const aluno = alunos.find((item) => item.id === sessao?.id);

  if (!aluno) {
    return (
      <div className="section">
        <div className="card mx-auto max-w-md p-5 text-center">
          <h1 className="heading-md">Matrícula não encontrada</h1>
          <p className="body-muted mt-2">
            Esta conta não está mais vinculada a um aluno. Procure o professor.
          </p>
        </div>
      </div>
    );
  }

  const turma = turmas.find((item) => item.id === aluno.turmaId);
  const programa = programaDaFaixa(aluno.faixa);

  return (
    <>
      <HeroPagina
        compacto
        sobretitulo="Portal do Aluno"
        titulo={`Olá, ${aluno.nome.split(" ")[0]}`}
        imagem="/imagens/faixa.jpg"
        acao={<StatusBadge status={aluno.status} />}
      />

      <div className="section space-y-4 py-6">
      {/* Identificação e progresso */}
      <section className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-line bg-elevated text-lg font-semibold text-fg"
            aria-hidden
          >
            {aluno.foto}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-fg">{aluno.nome}</h2>
              <BeltBadge cor={aluno.corFaixa}>{aluno.faixa}</BeltBadge>
              <Badge>Frequência {aluno.frequencia}%</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">
              {aluno.idade} anos · Turma {turma?.nome ?? "não definida"}
            </p>

            <div className="mt-4">
              <div className="flex items-end justify-between gap-4">
                <p className="label">Progresso para o próximo exame</p>
                <p className="text-xs font-semibold tabular-nums text-fg">
                  {aluno.progresso}%
                </p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${aluno.progresso}%` }}
                />
              </div>
              <p className="mt-1.5 text-2xs text-subtle">
                Próximo exame de graduação: {aluno.proximoExame}
              </p>
            </div>
          </div>
        </div>
      </section>

      </div>

      {/* Quadro de horários — faixa separando a identificação do aluno
          (acima) do bloco financeiro e de estudo (abaixo). */}
      {turma ? (
        <div className="faixa-destacada py-8">
          <div className="section">
        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <div>
              <h2 className="heading-md">Quadro de horários</h2>
              <p className="mt-0.5 text-xs text-muted">
                Turma {turma.nome} · {turma.faixaEtaria} ·{" "}
                {horarioDaTurma(turma)}
              </p>
            </div>
            <Badge tone="accent">
              {turma.inicio} às {turma.fim}
            </Badge>
          </div>

          <div className="grid divide-y divide-line md:grid-cols-2 md:divide-y-0">
            {turma.plano.map((aula, indice) => (
              <div
                key={aula.dia + aula.foco}
                className={`px-4 py-3 ${indice === 0 ? "md:border-r md:border-line" : ""}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-fg">
                    {aula.dia}
                    <span className="ml-2 text-2xs font-normal text-subtle">
                      {turma.inicio} às {turma.fim}
                    </span>
                  </p>
                  <span className="text-2xs font-medium text-accent">
                    {aula.foco}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {aula.conteudo.filter(Boolean).map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-xs leading-relaxed text-fg/85"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="border-t border-line px-4 py-2.5 text-2xs text-subtle">
            Faixas típicas da turma: {turma.faixasTipicas}. O conteúdo pode ser
            ajustado pelo professor a cada semana.
          </p>
        </section>
          </div>
        </div>
      ) : null}

      <div className="section space-y-4 py-6">
      {/* Financeiro, programa e atalhos */}
      <section className="grid gap-3 lg:grid-cols-3">
        <div className="card">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Mensalidade</h2>
          </div>
          <div className="p-4">
            <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em] text-fg">
              R$ {formatarReais(mensalidadeCentavos)}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Valor único · vence dia 10
            </p>
            <div className="mt-3">
              <StatusBadge status={aluno.status} />
            </div>
            <Button
              size="sm"
              className="mt-4 w-full"
              onClick={() => setCheckoutAberto(true)}
            >
              Ir para o checkout
            </Button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Programa da faixa atual</h2>
            <span className="text-2xs text-subtle">{programa?.grau}</span>
          </div>
          <ul className="divide-y divide-line">
            {[
              ...(programa?.katasExigidos ?? []),
              ...(programa?.kihonExigido ?? []),
            ].map((item) => (
              <li key={item} className="px-4 py-2 text-xs text-fg/85">
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t border-line p-3">
            <ButtonLink
              href="/estudos/fundamentos"
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Ver exigências completas
            </ButtonLink>
          </div>
        </div>

        <div className="card">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Continuar estudando</h2>
          </div>
          <ul className="divide-y divide-line">
            {[
              {
                href: "/estudos/tecnicas/kata/heian-yondan",
                label: "Kata Heian Yondan",
              },
              { href: "/estudos/tecnicas", label: "Kihon e tabelas de katas" },
              { href: "/estudos/historia", label: "Linhagem dos mestres" },
              { href: "/estudos/fundamentos", label: "Dojo Kun e princípios" },
            ].map((atalho) => (
              <li key={atalho.href}>
                <Link
                  href={atalho.href}
                  className="flex items-center justify-between px-4 py-2.5 text-xs text-fg/85 transition-colors hover:bg-elevated"
                >
                  {atalho.label}
                  <span className="text-subtle">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CheckoutModal
        aberto={checkoutAberto}
        onClose={() => setCheckoutAberto(false)}
        usuario={aluno.usuario}
        valorCentavos={mensalidadeCentavos}
      />
      </div>
    </>
  );
}
