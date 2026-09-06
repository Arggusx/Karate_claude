"use client";

import { cn } from "@/lib/cn";

/** Busca por nome ou nome de usuário, usada acima das listas de alunos. */
export function CampoBusca({
  id,
  valor,
  onChange,
  placeholder = "Buscar por nome ou usuário",
  className,
}: {
  id: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </span>
      <input
        id={id}
        type="search"
        value={valor}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input pl-8"
      />
      {valor ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 text-xs text-subtle transition-colors hover:text-fg"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}

/** Normaliza texto para comparação: minúsculo e sem acento. */
export function paraBusca(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
