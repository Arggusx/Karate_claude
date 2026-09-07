"use client";

import { cn } from "@/lib/cn";

export interface TabOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/** Segmented control compacto (Kihon / Katas, abas do portal). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  destaque = false,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Escolha central da página (Kihon / Katas): ganha peso e o acento vermelho. */
  destaque?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="Visualização"
      className={cn(
        // w-fit + self-start: como filho de um flex-column, o `align-items:
        // stretch` padrão esticava a borda até a largura da tela no mobile,
        // deixando um vazio à direita das abas.
        //
        // max-w-full + overflow-x-auto: com cinco abas (portal do admin) o
        // conjunto não cabe em 375px e transbordava cortado. Agora rola na
        // horizontal em vez de sumir fora da tela.
        "inline-flex w-fit max-w-full self-start overflow-x-auto rounded-md border p-0.5",
        destaque
          ? "border-line-strong bg-surface"
          : "border-line bg-elevated",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              // shrink-0: dentro do container rolável, as abas mantêm a
              // largura do rótulo em vez de comprimirem o texto.
              "shrink-0 whitespace-nowrap rounded transition-colors duration-150",
              destaque
                ? "px-5 py-2 text-sm font-semibold uppercase tracking-[0.06em]"
                : "px-3 py-1.5 text-sm font-medium",
              active && destaque && "bg-accent text-white",
              active && !destaque && "bg-surface text-fg shadow-sm",
              !active && "text-muted hover:text-fg",
            )}
          >
            {option.label}
            {option.hint ? (
              <span className="ml-1.5 text-2xs font-normal text-subtle">
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Chips de filtro rápido. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-150",
              active
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
