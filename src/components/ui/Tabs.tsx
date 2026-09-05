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
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Visualização"
      className={cn(
        "inline-flex rounded-md border border-line bg-elevated p-0.5",
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
              "rounded px-3 py-1.5 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-surface text-fg shadow-sm"
                : "text-muted hover:text-fg",
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
