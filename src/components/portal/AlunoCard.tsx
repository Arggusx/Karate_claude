"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Aluno } from "@/types";

/**
 * Versão mobile das tabelas de alunos: colapsado mostra só o nome (e a ação
 * principal, quando existe); expandido revela o restante das informações.
 */
export function AlunoCard({
  aluno,
  acao,
  onDetalhe,
  children,
}: {
  aluno: Aluno;
  acao?: ReactNode;
  /** Abre a ficha completa. Sem isto o card só expande. */
  onDetalhe?: () => void;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <article className="card">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setAberto((atual) => !atual)}
          aria-expanded={aberto}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-line bg-elevated text-2xs font-medium text-fg">
            {aluno.foto}
          </span>
          <span className="truncate text-sm font-medium text-fg">
            {aluno.nome}
          </span>
          <span
            aria-hidden
            className={cn(
              "ml-auto shrink-0 text-2xs text-subtle transition-transform duration-200",
              aberto && "rotate-180",
            )}
          >
            ▾
          </span>
        </button>
        {onDetalhe ? (
          <button
            type="button"
            onClick={onDetalhe}
            className="shrink-0 rounded border border-line px-2 py-1 text-2xs text-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            Ficha
          </button>
        ) : null}
        {acao ? <div className="shrink-0">{acao}</div> : null}
      </div>

      {aberto ? (
        <dl className="divide-y divide-line border-t border-line">{children}</dl>
      ) : null}
    </article>
  );
}

/** Linha rótulo / valor dentro do card expandido. */
export function AlunoCampo({
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
