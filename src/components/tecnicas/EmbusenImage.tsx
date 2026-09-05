"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Exibe a imagem de embusen indicada no JSON. Quando o arquivo ainda não
 * existe em `/public`, mostra a área reservada em vez de um ícone quebrado.
 */
export function EmbusenImage({
  src,
  alt,
  legenda,
}: {
  src: string;
  alt: string;
  legenda: string;
}) {
  const [falhou, setFalhou] = useState(!src);
  const imgRef = useRef<HTMLImageElement>(null);

  // A imagem pode falhar antes da hidratação: confere o estado ao montar.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFalhou(true);
  }, []);

  return (
    <figure className="flex flex-col">
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-line bg-elevated">
        {falhou ? (
          <div className="px-3 text-center">
            <p className="text-2xs font-medium text-muted">Área reservada</p>
            <p className="mt-1 break-all font-mono text-[10px] leading-tight text-subtle">
              {src || "caminho não informado"}
            </p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onError={() => setFalhou(true)}
            className="h-full w-full object-contain"
          />
        )}
      </div>
      <figcaption className="mt-1.5 text-2xs text-subtle">{legenda}</figcaption>
    </figure>
  );
}
