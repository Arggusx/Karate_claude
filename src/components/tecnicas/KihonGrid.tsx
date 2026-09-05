"use client";

import { useState } from "react";
import { TecnicaDetalhe, TecnicaModal } from "@/components/tecnicas/TecnicaModal";
import { cn } from "@/lib/cn";
import type { Tecnica } from "@/types";

export function KihonGrid({ tecnicas }: { tecnicas: Tecnica[] }) {
  const [selecionada, setSelecionada] = useState<Tecnica | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);

  if (tecnicas.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="body-muted">
          Nenhuma técnica encontrada para o filtro selecionado.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {tecnicas.map((tecnica) => {
          const aberta = expandida === tecnica.nome;

          return (
            <article key={tecnica.nome} className="card card-hover">
              {/*
                No desktop o card abre o modal; no mobile ele expande em
                acordeão, evitando um modal em tela pequena.
              */}
              <button
                type="button"
                onClick={() => setSelecionada(tecnica)}
                className="hidden w-full p-3.5 text-left sm:block"
              >
                <Cabecalho tecnica={tecnica} />
                <span className="mt-2.5 flex items-center justify-between border-t border-line pt-2">
                  <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
                    {tecnica.cat} · {tecnica.tipo}
                  </span>
                  <span className="text-2xs font-medium text-accent">
                    Ver detalhes →
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExpandida(aberta ? null : tecnica.nome)}
                aria-expanded={aberta}
                className="w-full p-3.5 text-left sm:hidden"
              >
                <Cabecalho tecnica={tecnica} />
                <span className="mt-2.5 flex items-center justify-between border-t border-line pt-2">
                  <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
                    {tecnica.cat} · {tecnica.tipo}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "text-2xs text-accent transition-transform duration-200",
                      aberta && "rotate-180",
                    )}
                  >
                    ▾
                  </span>
                </span>
              </button>

              {aberta ? (
                <div className="border-t border-line p-3.5 sm:hidden">
                  <TecnicaDetalhe tecnica={tecnica} compacto />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <TecnicaModal
        tecnica={selecionada}
        onClose={() => setSelecionada(null)}
      />
    </>
  );
}

function Cabecalho({ tecnica }: { tecnica: Tecnica }) {
  return (
    <>
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-fg">{tecnica.nome}</span>
        <span className="shrink-0 text-xs text-subtle">{tecnica.kanji}</span>
      </span>
      <span className="mt-0.5 block text-xs font-medium text-accent">
        {tecnica.pt}
      </span>
      <span className="mt-2 block text-xs leading-relaxed text-muted">
        {tecnica.desc}
      </span>
    </>
  );
}
