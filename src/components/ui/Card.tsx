import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  hover = false,
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}) {
  return (
    <div className={cn("card", hover && "card-hover", className)}>
      {children}
    </div>
  );
}

/** Cabeçalho de card com título e ação opcional à direita. */
export function CardHeader({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div>
        <h3 className="heading-md">{titulo}</h3>
        {descricao ? (
          <p className="mt-0.5 text-xs text-muted">{descricao}</p>
        ) : null}
      </div>
      {acao}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  titulo,
  descricao,
  acao,
  className,
}: {
  eyebrow?: string;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="heading-lg mt-1">{titulo}</h2>
        {descricao ? <p className="body-muted mt-1.5">{descricao}</p> : null}
      </div>
      {acao}
    </div>
  );
}

/** Kanji decorativo em marca d'água. */
export function KanjiMark({
  kanji,
  className,
}: {
  kanji: string;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("kanji-mark absolute", className)}>
      {kanji}
    </span>
  );
}
