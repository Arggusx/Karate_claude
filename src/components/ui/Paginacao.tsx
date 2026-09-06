"use client";

import { cn } from "@/lib/cn";

/**
 * Paginação de listas. Mostra o intervalo exibido, os números das páginas
 * (com reticências quando são muitas) e os botões anterior / próximo.
 */
export function Paginacao({
  total,
  pagina,
  porPagina,
  onPagina,
  rotulo = "registros",
}: {
  total: number;
  pagina: number;
  porPagina: number;
  onPagina: (pagina: number) => void;
  rotulo?: string;
}) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  if (total === 0) return null;

  const primeiro = (pagina - 1) * porPagina + 1;
  const ultimo = Math.min(pagina * porPagina, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-1 pt-2.5">
      <p className="text-2xs tabular-nums text-muted">
        Exibindo {primeiro}–{ultimo} de {total} {rotulo}
      </p>

      {paginas > 1 ? (
        <nav className="flex items-center gap-1" aria-label="Paginação">
          <BotaoPagina
            desabilitado={pagina === 1}
            onClick={() => onPagina(pagina - 1)}
          >
            Anterior
          </BotaoPagina>

          {numerosVisiveis(pagina, paginas).map((numero, indice) =>
            numero === null ? (
              <span
                key={`reticencias-${indice}`}
                className="px-1 text-2xs text-subtle"
              >
                …
              </span>
            ) : (
              <BotaoPagina
                key={numero}
                ativo={numero === pagina}
                onClick={() => onPagina(numero)}
                rotulo={`Página ${numero}`}
              >
                {numero}
              </BotaoPagina>
            ),
          )}

          <BotaoPagina
            desabilitado={pagina === paginas}
            onClick={() => onPagina(pagina + 1)}
          >
            Próximo
          </BotaoPagina>
        </nav>
      ) : null}
    </div>
  );
}

/** Janela de números ao redor da página atual: 1 … 4 5 6 … 12 */
function numerosVisiveis(atual: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }

  const janela = new Set([1, total, atual, atual - 1, atual + 1]);
  const numeros = [...janela]
    .filter((numero) => numero >= 1 && numero <= total)
    .sort((a, b) => a - b);

  const resultado: (number | null)[] = [];
  numeros.forEach((numero, indice) => {
    if (indice > 0 && numero - numeros[indice - 1] > 1) resultado.push(null);
    resultado.push(numero);
  });
  return resultado;
}

function BotaoPagina({
  children,
  onClick,
  ativo = false,
  desabilitado = false,
  rotulo,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ativo?: boolean;
  desabilitado?: boolean;
  rotulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      aria-label={rotulo}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "min-w-[1.75rem] rounded-md border px-2 py-1 text-2xs font-medium transition-colors",
        ativo
          ? "border-accent bg-accent text-white"
          : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg",
        desabilitado && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}
