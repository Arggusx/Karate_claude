"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { TimelineItem } from "@/types";

/**
 * Linha do tempo de eixo central: os marcos alternam entre a esquerda e a
 * direita no desktop e empilham à direita do eixo no mobile.
 */
export function LinhaDoTempo({ marcos }: { marcos: TimelineItem[] }) {
  const [aberto, setAberto] = useState<string | null>(marcos[0]?.year ?? null);

  return (
    <div className="relative">
      {/* eixo */}
      <span
        aria-hidden
        className="absolute left-[7px] top-0 h-full w-px bg-line md:left-1/2 md:-translate-x-1/2"
      />

      <ol className="space-y-3">
        {marcos.map((marco, indice) => {
          const expandido = aberto === marco.year;
          const aEsquerda = indice % 2 === 0;

          return (
            <li
              key={marco.year}
              className={cn(
                "relative pl-7 md:w-1/2 md:pl-0",
                aEsquerda ? "md:pr-8" : "md:ml-auto md:pl-8",
              )}
            >
              {/* marcador no eixo */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-4 z-10 h-3.5 w-3.5 rounded-full border-2 border-canvas transition-colors md:left-auto md:top-4",
                  expandido ? "bg-accent" : "bg-line-strong",
                  aEsquerda ? "md:-right-[7px]" : "md:-left-[7px]",
                )}
              />
              {/* conector até o eixo */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-[22px] hidden h-px w-8 bg-line md:block",
                  aEsquerda ? "right-0" : "left-0",
                )}
              />

              <div
                className={cn(
                  "card card-hover relative overflow-hidden",
                  expandido && "border-accent/40",
                )}
              >
                <span
                  aria-hidden
                  className="kanji-mark absolute right-3 top-1/2 -translate-y-1/2 text-5xl"
                >
                  {marco.kanji}
                </span>

                <button
                  onClick={() => setAberto(expandido ? null : marco.year)}
                  aria-expanded={expandido}
                  className={cn(
                    "relative w-full px-4 py-3 text-left",
                    aEsquerda && "md:text-right",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-2",
                      aEsquerda && "md:justify-end",
                    )}
                  >
                    <span className="text-xs font-medium tabular-nums text-accent">
                      {marco.year}
                    </span>
                    <span className="text-2xs text-subtle">{marco.kanji}</span>
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-fg">
                    {marco.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                    {marco.text}
                  </span>
                </button>

                {expandido ? (
                  <div
                    className={cn(
                      "relative border-t border-line px-4 py-3",
                      aEsquerda && "md:text-right",
                    )}
                  >
                    <p className="text-2xs uppercase tracking-[0.08em] text-subtle">
                      {marco.kanjiTranslate}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-fg/85">
                      {marco.detail}
                    </p>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
