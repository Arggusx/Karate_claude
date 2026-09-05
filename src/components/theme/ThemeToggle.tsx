"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Alterna claro/escuro. Só renderiza o ícone depois de montado para evitar
 * divergência de hidratação entre servidor e cliente.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  const escuro = resolvedTheme === "dark";
  // Antes da montagem o tema ainda é desconhecido: rótulo neutro nos dois lados.
  const rotulo = !montado
    ? "Alternar tema"
    : escuro
      ? "Ativar tema claro"
      : "Ativar tema escuro";

  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      onClick={() => setTheme(escuro ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      {montado ? (
        escuro ? (
          <SunIcon />
        ) : (
          <MoonIcon />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
