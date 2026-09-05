"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Menu hambúrguer usado nos cabeçalhos quando a navegação não cabe na
 * largura do celular. Fecha ao trocar de rota, ao clicar fora e no Esc.
 */
export function MenuMobile({
  children,
  className,
  rotulo = "Abrir menu",
}: {
  children: ReactNode;
  className?: string;
  rotulo?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  useEffect(() => setAberto(false), [pathname]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label={rotulo}
        aria-expanded={aberto}
        onClick={() => setAberto((atual) => !atual)}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        {aberto ? <IconeFechar /> : <IconeMenu />}
      </button>

      {aberto ? (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setAberto(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            className="card absolute right-0 top-11 z-50 w-60 p-1.5 shadow-lg"
            onClick={() => setAberto(false)}
          >
            {children}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Item de navegação dentro do menu. */
export function MenuMobileLink({
  href,
  children,
  ativo = false,
}: {
  href: string;
  children: ReactNode;
  ativo?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex items-center justify-between rounded px-3 py-2 text-sm font-medium transition-colors",
        ativo ? "bg-elevated text-fg" : "text-muted hover:bg-elevated hover:text-fg",
      )}
    >
      {children}
      {ativo ? <span className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
    </Link>
  );
}

export function MenuMobileSeparador() {
  return <div className="my-1.5 h-px bg-line" />;
}

function IconeMenu() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconeFechar() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
