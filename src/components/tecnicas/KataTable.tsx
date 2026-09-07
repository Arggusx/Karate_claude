"use client";

import Link from "next/link";
import { useState } from "react";
import { BeltBadge, NivelTag } from "@/components/ui/Badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { listarDestaques } from "@/services/dataService";
import type { KataCompleto } from "@/types";

export function KataTable({
  titulo,
  descricao,
  katas,
}: {
  titulo: string;
  descricao: string;
  katas: KataCompleto[];
}) {
  const [aberto, setAberto] = useState<string | null>(null);

  if (katas.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="heading-md">{titulo}</h3>
          <p className="mt-0.5 text-xs text-muted">{descricao}</p>
        </div>
        <span className="text-2xs tabular-nums text-subtle">
          {katas.length} katas
        </span>
      </div>

      {/*
        Mobile: um card por kata, colapsado mostrando só nome e nível — o
        mesmo padrão das tabelas de aluno do portal. A tabela de sete colunas
        exige 1000px de largura e só faz sentido no desktop.
      */}
      <div className="space-y-2 sm:hidden">
        {katas.map((kata) => (
          <CardKata
            key={kata.id}
            kata={kata}
            aberto={aberto === kata.id}
            onAlternar={() => setAberto(aberto === kata.id ? null : kata.id)}
          />
        ))}
      </div>

      <div className="hidden sm:block">
        <Table minWidth="min-w-[1000px]">
          <THead>
            <TR>
              <TH>Kata</TH>
              <TH className="text-right">Mov.</TH>
              <TH>Nível</TH>
              <TH>Significado</TH>
              <TH>Kiais</TH>
              <TH>Faixa recomendada</TH>
              <TH>Movimentos destaque</TH>
            </TR>
          </THead>
          <TBody>
            {katas.map((kata) => (
              <TR key={kata.id}>
                <TD>
                  <Link
                    href={`/estudos/tecnicas/kata/${kata.id}`}
                    className="font-medium text-fg hover:text-accent"
                  >
                    {kata.nome}
                  </Link>
                  {kata.kanji ? (
                    <span className="ml-1.5 text-2xs text-subtle">
                      {kata.kanji}
                    </span>
                  ) : null}
                </TD>
                <TD className="text-right tabular-nums">
                  {kata.quantidadeMovimentos}
                </TD>
                <TD>
                  <NivelTag nivel={kata.nivel}>
                    {kata.nivelDificuldade}
                  </NivelTag>
                </TD>
                <TD className="max-w-[220px] text-muted">
                  {kata.significadoNome}
                </TD>
                <TD className="whitespace-nowrap text-muted">
                  {kata.posicoesKiai}
                </TD>
                <TD>
                  <BeltBadge cor={kata.corFaixa}>
                    {kata.faixaRecomendada}
                  </BeltBadge>
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {listarDestaques(kata).map((destaque) => (
                      <span
                        key={destaque}
                        className="rounded border border-line bg-elevated px-1.5 py-0.5 text-2xs text-muted"
                      >
                        {destaque}
                      </span>
                    ))}
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </section>
  );
}

/** Versão mobile: colapsado mostra nome, kanji e a tag de nível. */
function CardKata({
  kata,
  aberto,
  onAlternar,
}: {
  kata: KataCompleto;
  aberto: boolean;
  onAlternar: () => void;
}) {
  return (
    <article className="card">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberto}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">
            {kata.nome}
            {kata.kanji ? (
              <span className="ml-1.5 text-2xs font-normal text-subtle">
                {kata.kanji}
              </span>
            ) : null}
          </span>
        </span>
        <NivelTag nivel={kata.nivel}>{kata.nivelDificuldade}</NivelTag>
        <span
          aria-hidden
          className={cn(
            "shrink-0 text-2xs text-subtle transition-transform duration-200",
            aberto && "rotate-180",
          )}
        >
          ▾
        </span>
      </button>

      {aberto ? (
        <dl className="divide-y divide-line border-t border-line">
          <Campo rotulo="Movimentos">
            <span className="tabular-nums">{kata.quantidadeMovimentos}</span>
          </Campo>
          <Campo rotulo="Significado">{kata.significadoNome}</Campo>
          <Campo rotulo="Kiais">{kata.posicoesKiai}</Campo>
          <Campo rotulo="Faixa">
            <BeltBadge cor={kata.corFaixa}>{kata.faixaRecomendada}</BeltBadge>
          </Campo>
          <div className="px-3 py-2">
            <dt className="text-2xs uppercase tracking-[0.08em] text-muted">
              Movimentos destaque
            </dt>
            <dd className="mt-1.5 flex flex-wrap gap-1">
              {listarDestaques(kata).map((destaque) => (
                <span
                  key={destaque}
                  className="rounded border border-line bg-elevated px-1.5 py-0.5 text-2xs text-muted"
                >
                  {destaque}
                </span>
              ))}
            </dd>
          </div>
          <div className="px-3 py-2.5">
            <Link
              href={`/estudos/tecnicas/kata/${kata.id}`}
              className="text-xs font-medium text-accent"
            >
              Abrir ficha completa →
            </Link>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

function Campo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2">
      <dt className="shrink-0 text-2xs uppercase tracking-[0.08em] text-muted">
        {rotulo}
      </dt>
      <dd className="text-right text-xs text-fg">{children}</dd>
    </div>
  );
}
