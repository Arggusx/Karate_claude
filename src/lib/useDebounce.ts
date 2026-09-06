"use client";

import { useEffect, useState } from "react";

/** Devolve o valor só depois de `atraso` ms sem novas mudanças. */
export function useDebounce<T>(valor: T, atraso = 400): T {
  const [adiado, setAdiado] = useState(valor);

  useEffect(() => {
    const id = window.setTimeout(() => setAdiado(valor), atraso);
    return () => window.clearTimeout(id);
  }, [valor, atraso]);

  return adiado;
}
