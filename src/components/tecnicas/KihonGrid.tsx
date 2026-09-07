"use client";

import { useMemo, useState } from "react";
import { TecnicaDetalhe, TecnicaModal } from "@/components/tecnicas/TecnicaModal";
import { cn } from "@/lib/cn";
import { getCategoriasTecnicas } from "@/services/dataService";
import type { Tecnica } from "@/types";

const CATEGORIAS = getCategoriasTecnicas();

export function KihonGrid({ tecnicas }: { tecnicas: Tecnica[] }) {
  const [selecionada, setSelecionada] = useState<Tecnica | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);

  /**
   * Agrupa por categoria mantendo a ordem do acervo (Socos, Chutes, Defesas,
   * Bases). Grupo vazio não é renderizado, então o filtro continua valendo:
   * filtrar por "Chutes" apenas deixa um grupo só na tela.
   */
  const grupos = useMemo(
    () =>
      CATEGORIAS.map((categoria) => ({
        categoria,
        itens: tecnicas.filter((tecnica) => tecnica.cat === categoria.id),
      })).filter((grupo) => grupo.itens.length > 0),
    [tecnicas],
  );

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
      <div className="space-y-8">
        {grupos.map(({ categoria, itens }) => (
          <section key={categoria.id}>
            <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
              <h3 className="heading-lg">
                {categoria.label}
                <span
                  aria-hidden
                  className="ml-2 text-sm font-normal text-subtle"
                >
                  {categoria.kanji}
                </span>
              </h3>
              <span className="text-2xs tabular-nums text-subtle">
                {itens.length} técnicas
              </span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {itens.map((tecnica) => (
                <CardTecnica
                  key={tecnica.nome}
                  tecnica={tecnica}
                  aberta={expandida === tecnica.nome}
                  onAbrirModal={() => setSelecionada(tecnica)}
                  onAlternar={() =>
                    setExpandida(
                      expandida === tecnica.nome ? null : tecnica.nome,
                    )
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <TecnicaModal
        tecnica={selecionada}
        onClose={() => setSelecionada(null)}
      />
    </>
  );
}

/**
 * No desktop o card abre o modal; no mobile ele expande em acordeão, evitando
 * um modal em tela pequena.
 */
function CardTecnica({
  tecnica,
  aberta,
  onAbrirModal,
  onAlternar,
}: {
  tecnica: Tecnica;
  aberta: boolean;
  onAbrirModal: () => void;
  onAlternar: () => void;
}) {
  return (
    <article className="card card-hover">
      <button
        type="button"
        onClick={onAbrirModal}
        className="hidden w-full p-3.5 text-left sm:block"
      >
        <Cabecalho tecnica={tecnica} />
        <span className="mt-2.5 flex items-center justify-between border-t border-line pt-2">
          <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
            {tecnica.tipo}
          </span>
          <span className="text-2xs font-medium text-accent">
            Ver detalhes →
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberta}
        className="w-full p-3.5 text-left sm:hidden"
      >
        <Cabecalho tecnica={tecnica} />
        <span className="mt-2.5 flex items-center justify-between border-t border-line pt-2">
          <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
            {tecnica.tipo}
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
