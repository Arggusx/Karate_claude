"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { baseDoMovimento, type TracadoEmbusen } from "@/services/embusen";

/**
 * Diagrama do embusen com o kata sendo percorrido passo a passo.
 *
 * Dois modos, como nos manuais: "traçado" mostra só a linha de deslocamento;
 * "completo" acrescenta a base de cada movimento. O botão percorre a sequência
 * no ritmo, destacando o passo atual e pulsando nos movimentos com kiai.
 *
 * É desenhado em SVG, não em imagem: só assim o marcador tem um caminho para
 * seguir, e só assim o diagrama acompanha o tema claro/escuro.
 */
export function Embusen({
  tracado,
  movimentos,
}: {
  tracado: TracadoEmbusen;
  movimentos: string[];
}) {
  const [modo, setModo] = useState<"tracado" | "completo">("tracado");
  const [atual, setAtual] = useState(0);
  const [tocando, setTocando] = useState(false);
  const timer = useRef<number | null>(null);

  const passos = tracado.passos;

  useEffect(() => {
    if (!tocando) return;

    timer.current = window.setInterval(() => {
      setAtual((i) => {
        if (i >= passos.length - 1) {
          setTocando(false);
          return i;
        }
        return i + 1;
      });
    }, 1100);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [tocando, passos.length]);

  // Caixa do desenho a partir dos próprios pontos, com folga para o marcador.
  const xs = passos.map((p) => p.x);
  const ys = passos.map((p) => p.y);
  const folga = 1;
  const minX = Math.min(0, ...xs) - folga;
  const maxX = Math.max(0, ...xs) + folga;
  const minY = Math.min(0, ...ys) - folga;
  const maxY = Math.max(0, ...ys) + folga;

  // y do SVG cresce para baixo; o do tatame cresce para cima. Daí a inversão.
  const px = (x: number) => x - minX;
  const py = (y: number) => maxY - y;

  const linha = [{ x: 0, y: 0 }, ...passos]
    .map((p) => `${px(p.x).toFixed(2)},${py(p.y).toFixed(2)}`)
    .join(" ");

  const passo = passos[atual];
  const movimento = movimentos[passo.numero - 1] ?? "";
  const base = passo.base ?? baseDoMovimento(movimento);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div>
          <h3 className="heading-md">Embusen · 演武線</h3>
          <p className="mt-0.5 text-2xs text-muted">
            Linha de deslocamento — forma de {tracado.forma}
          </p>
        </div>
        <div className="inline-flex w-fit shrink-0 overflow-hidden rounded-md border border-line">
          {(
            [
              ["tracado", "Traçado"],
              ["completo", "Com bases"],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setModo(valor)}
              className={cn(
                "px-3 py-1 text-2xs font-medium transition-colors",
                modo === valor
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-fg",
              )}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      {tracado.emConferencia ? (
        <p className="border-b border-status-warn/40 bg-status-warn/10 px-4 py-2 text-2xs leading-relaxed text-status-warn">
          Traçado ainda em conferência contra referência técnica. A sequência de
          movimentos abaixo está correta; as posições no diagrama podem mudar.
        </p>
      ) : null}

      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_1.1fr]">
        <svg
          viewBox={`0 0 ${maxX - minX} ${maxY - minY}`}
          className="w-full rounded-md border border-line bg-canvas"
          role="img"
          aria-label={`Diagrama do embusen, forma de ${tracado.forma}`}
        >
          {/* Malha do tatame, para dar noção de distância. */}
          <defs>
            <pattern id="malha" width="1" height="1" patternUnits="userSpaceOnUse">
              <path
                d="M1 0 L0 0 0 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.02"
                className="text-line"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#malha)" />

          <polyline
            points={linha}
            fill="none"
            strokeWidth="0.14"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-line-strong"
            stroke="currentColor"
          />

          {/* Ponto de início (yoi). */}
          <circle
            cx={px(0)}
            cy={py(0)}
            r="0.16"
            className="text-muted"
            fill="currentColor"
          />

          {modo === "completo"
            ? passos.map((p, i) => (
                <g key={p.numero} opacity={i <= atual ? 1 : 0.25}>
                  {/* Cunha apontando para onde o praticante olha. */}
                  <path
                    d="M0,-0.34 L0.2,0.14 L-0.2,0.14 Z"
                    transform={`translate(${px(p.x)} ${py(p.y)}) rotate(${p.olhar})`}
                    className="text-accent"
                    fill="currentColor"
                    opacity="0.55"
                  />
                </g>
              ))
            : null}

          {/* Marcador do passo atual. */}
          <g transform={`translate(${px(passo.x)} ${py(passo.y)})`}>
            {passo.kiai ? (
              <circle r="0.5" className="text-accent" fill="currentColor" opacity="0.2">
                <animate
                  attributeName="r"
                  values="0.35;0.7;0.35"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            ) : null}
            <path
              d="M0,-0.4 L0.24,0.18 L-0.24,0.18 Z"
              transform={`rotate(${passo.olhar})`}
              className="text-accent"
              fill="currentColor"
            />
          </g>
        </svg>

        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-accent">
              {String(passo.numero).padStart(2, "0")}
            </span>
            <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
              de {passos.length}
            </span>
            {passo.kiai ? (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-2xs font-medium text-accent">
                KIAI
              </span>
            ) : null}
          </div>

          {base ? (
            <p className="mt-1 text-xs font-medium text-gold">{base}</p>
          ) : null}

          {/*
            Foto do movimento, quando existe. O diagrama funciona sem nenhuma —
            cada foto cadastrada aparece sozinha no passo dela, sem deixar
            buraco nos passos que ainda não têm.
          */}
          {passo.foto ? (
            <figure className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-md border border-line bg-elevated">
              <Image
                src={passo.foto}
                alt={`Movimento ${passo.numero} do kata`}
                fill
                sizes="(min-width: 640px) 320px, 100vw"
                className="object-cover"
              />
              {passo.fotoCredito ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-2xs text-white">
                  {passo.fotoCredito}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <p className="mt-2 min-h-[3.5rem] text-xs leading-relaxed text-fg/85">
            {movimento}
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
            <Button
              size="sm"
              onClick={() => {
                if (atual >= passos.length - 1) setAtual(0);
                setTocando((t) => !t);
              }}
            >
              {tocando ? "Pausar" : "Executar kata"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTocando(false);
                setAtual((i) => Math.max(0, i - 1));
              }}
            >
              ←
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTocando(false);
                setAtual((i) => Math.min(passos.length - 1, i + 1));
              }}
            >
              →
            </Button>
          </div>

          {/* Régua de passos: clicável, e mostra onde estão os kiai. */}
          <div className="mt-3 flex flex-wrap gap-1">
            {passos.map((p, i) => (
              <button
                key={p.numero}
                type="button"
                aria-label={`Movimento ${p.numero}`}
                onClick={() => {
                  setTocando(false);
                  setAtual(i);
                }}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i === atual
                    ? "bg-accent"
                    : i < atual
                      ? "bg-accent/40"
                      : p.kiai
                        ? "bg-gold/50"
                        : "bg-elevated",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
