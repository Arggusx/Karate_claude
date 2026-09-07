"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Entrada suave ao entrar na viewport, com GSAP + ScrollTrigger.
 *
 * O conteúdo já vem visível no HTML: a animação só é armada depois que o JS
 * carrega e apenas quando o visitante não pediu menos movimento. Assim nada
 * fica invisível se o script falhar ou se `prefers-reduced-motion` estiver
 * ligado — a animação é enfeite, não requisito para ler a página.
 */
export function Revelar({
  children,
  className,
  atraso = 0,
  /** Deslocamento vertical inicial, em px. */
  distancia = 24,
}: {
  children: ReactNode;
  className?: string;
  atraso?: number;
  distancia?: number;
}) {
  const alvo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = alvo.current;
    if (!elemento) return;

    const menosMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (menosMovimento) return;

    let animacao: gsap.core.Tween | null = null;

    // Mesma guarda do hero: em aba de fundo o rAF não roda e a animação
    // congelaria com o conteúdo em opacidade 0. Sem montar nada, o texto
    // continua legível; ao ganhar foco, a revelação é armada.
    const armar = () => {
      if (animacao || document.visibilityState !== "visible") return;

      // Mesma regra do hero: nada de opacidade em elemento com conteúdo. Uma
      // revelação interrompida deixa o bloco deslocado, não invisível.
      gsap.registerPlugin(ScrollTrigger);
      animacao = gsap.fromTo(
        elemento,
        { y: distancia },
        {
          y: 0,
          duration: 0.7,
          delay: atraso,
          ease: "power2.out",
          scrollTrigger: { trigger: elemento, start: "top 88%", once: true },
        },
      );
    };

    armar();
    document.addEventListener("visibilitychange", armar);

    return () => {
      document.removeEventListener("visibilitychange", armar);
      animacao?.scrollTrigger?.kill();
      animacao?.kill();
      gsap.set(elemento, { clearProps: "all" });
    };
  }, [atraso, distancia]);

  return (
    <div ref={alvo} className={className}>
      {children}
    </div>
  );
}
