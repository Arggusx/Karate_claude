"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ButtonLink } from "@/components/ui/Button";
import { LuaVermelha } from "@/components/ui/LuaVermelha";

/**
 * Abertura da landing: foto sangrando, kanji 空手 em escala de cartaz e a
 * lua vermelha ao fundo.
 *
 * A entrada é animada com GSAP, mas nunca segura o conteúdo: se a animação não
 * puder rodar, o texto aparece do mesmo jeito.
 */
export function HeroLanding({
  katas,
  tecnicas,
}: {
  katas: number;
  tecnicas: number;
}) {
  const raiz = useRef<HTMLElement>(null);
  const linhaRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const elemento = raiz.current;
    if (!elemento) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let contexto: gsap.Context | null = null;

    /**
     * A animação só é montada com a aba visível.
     *
     * Em aba de fundo o requestAnimationFrame não roda: a timeline aplicaria
     * opacidade 0 no estado inicial e congelaria ali, deixando o título e os
     * botões invisíveis. Não montando nada, o HTML fica como veio — legível.
     * Quando a aba ganha foco, a animação é armada e roda do começo.
     */
    const armar = () => {
      if (contexto || document.visibilityState !== "visible") return;
      contexto = criarAnimacao(elemento);
    };

    armar();
    document.addEventListener("visibilitychange", armar);

    /**
     * Rede de segurança: se em 2,5s a timeline não terminou, salta para o fim.
     *
     * A animação depende de requestAnimationFrame, que o navegador congela em
     * aba de fundo, em renderização fora de tela e sob carga pesada. O timer
     * não depende de rAF, então garante que o hero sempre chega ao estado
     * legível — a entrada é enfeite, o texto não é.
     */
    const rede = window.setTimeout(() => {
      const linha = linhaRef.current;
      if (linha && linha.progress() < 1) linha.progress(1);
    }, 2500);

    return () => {
      window.clearTimeout(rede);
      document.removeEventListener("visibilitychange", armar);
      contexto?.revert();
    };
  }, []);

  function criarAnimacao(elemento: HTMLElement) {
    return gsap.context(() => {
      /**
       * Só transformação no que carrega texto — nunca opacidade.
       *
       * Animar opacidade a partir de 0 significa que qualquer interrupção
       * (aba de fundo, rAF congelado, erro no meio da timeline) deixa o
       * conteúdo invisível de forma permanente. Animando apenas o
       * deslocamento, o pior caso é o texto parar 24px fora do lugar — feio,
       * mas legível.
       *
       * fromTo em vez de from: `from` grava o estado atual como destino, e uma
       * segunda execução do efeito aprenderia o estado deslocado como final.
       */
      const linha = gsap.timeline({ defaults: { ease: "power3.out" } });
      linhaRef.current = linha;
      const deslocar = (y: number) => ({ y });
      const assentar = { y: 0 };

      linha
        .fromTo("[data-hero='kanji']", deslocar(40), {
          ...assentar,
          duration: 1.1,
        })
        .fromTo(
          "[data-hero='titulo']",
          deslocar(24),
          { ...assentar, duration: 0.8 },
          "-=0.6",
        )
        .fromTo(
          "[data-hero='texto']",
          deslocar(16),
          { ...assentar, duration: 0.7 },
          "-=0.5",
        )
        .fromTo(
          "[data-hero='acao']",
          deslocar(12),
          { ...assentar, duration: 0.6, stagger: 0.08 },
          "-=0.45",
        )
        // A lua também não anima opacidade: se a timeline congelasse, ela
        // sumiria. Só escala — travada em 0,92 ninguém percebe.
        .fromTo(
          "[data-hero='lua']",
          { scale: 0.92 },
          { scale: 1, duration: 1.4 },
          0.2,
        );
    }, elemento);
  }

  return (
    <section
      ref={raiz}
      className="relative isolate overflow-hidden bg-[#0B0B0D] text-white"
    >
      {/*
        Foto de fundo em preto e branco: a cor viria competir com o vermelho do
        kanji e do botão. Crédito e licença em public/imagens/CREDITOS.md.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[url('/imagens/hero-karate.jpg')] bg-cover bg-[position:70%_center] opacity-[0.45] grayscale"
      />

      {/* Gradiente que garante contraste do texto com ou sem foto. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_15%_20%,rgba(220,38,38,0.16),transparent_60%),linear-gradient(100deg,#0B0B0D_35%,rgba(11,11,13,0.72)_70%,rgba(11,11,13,0.45)_100%)]"
      />

      {/* 224px + 40% = 314px. Mesma posição de antes: inteira dentro da tela,
          alinhada com a margem direita do conteúdo. */}
      <div
        data-hero="lua"
        aria-hidden
        className="pointer-events-none absolute right-8 top-1/2 -z-10 hidden -translate-y-1/2 lg:block xl:right-16"
      >
        <LuaVermelha className="h-[314px] w-[314px] opacity-40" />
      </div>

      <div className="section relative py-24 sm:py-32 lg:py-40">
        <p
          data-hero="kanji"
          className="font-kanji text-[clamp(4.5rem,16vw,11rem)] leading-[0.85] tracking-[-0.04em] text-accent"
        >
          空手
        </p>

        <h1
          data-hero="titulo"
          className="mt-6 max-w-2xl font-display text-[clamp(1.8rem,4.5vw,3rem)] font-normal leading-[1.15] tracking-[-0.02em]"
        >
          O caminho da mão vazia, ensinado do jeito certo.
        </h1>

        <p
          data-hero="texto"
          className="mt-4 max-w-xl text-sm leading-relaxed text-gold sm:text-base"
        >
          Academia de Karatê Shotokan com linhagem, método e acompanhamento
          individual — somada a um portal de estudos com {katas} katas
          detalhados e {tecnicas} técnicas catalogadas.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <span data-hero="acao" className="inline-flex">
            <ButtonLink href="#matricula">Comece a treinar</ButtonLink>
          </span>
          <span data-hero="acao" className="inline-flex">
            <ButtonLink
              href="/estudos"
              className="border border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10"
            >
              Explorar o portal de estudos
            </ButtonLink>
          </span>
        </div>
      </div>
    </section>
  );
}
