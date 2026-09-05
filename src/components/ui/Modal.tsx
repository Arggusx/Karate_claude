"use client";

import { useEffect, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  titulo,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titulo?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="card relative z-10 max-h-[85vh] w-full max-w-lg animate-fade-in overflow-y-auto">
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          {titulo ? <h3 className="heading-md">{titulo}</h3> : <span />}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded px-1.5 text-lg leading-none text-muted transition-colors hover:text-fg"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
