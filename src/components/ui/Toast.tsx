"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Tom = "sucesso" | "erro" | "neutro";

interface Aviso {
  id: number;
  texto: string;
  tom: Tom;
}

interface ToastContexto {
  toast: (texto: string, tom?: Tom) => void;
}

const Contexto = createContext<ToastContexto | null>(null);

const ESTILOS: Record<Tom, string> = {
  sucesso: "border-status-ok/40 bg-surface text-status-ok",
  erro: "border-status-bad/40 bg-surface text-status-bad",
  neutro: "border-line bg-surface text-fg",
};

/** Notificações efêmeras no canto inferior direito. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  const toast = useCallback((texto: string, tom: Tom = "sucesso") => {
    const id = Date.now() + Math.random();
    setAvisos((atual) => [...atual, { id, texto, tom }]);
    window.setTimeout(
      () => setAvisos((atual) => atual.filter((aviso) => aviso.id !== id)),
      3500,
    );
  }, []);

  const valor = useMemo(() => ({ toast }), [toast]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`pointer-events-auto animate-fade-in rounded-md border px-3 py-2.5 text-xs font-medium shadow-lg ${ESTILOS[aviso.tom]}`}
          >
            {aviso.texto}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

export function useToast() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useToast precisa estar dentro de <ToastProvider>");
  }
  return contexto.toast;
}
