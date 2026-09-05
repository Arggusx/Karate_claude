"use client";

import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { Tecnica } from "@/types";

/**
 * Princípios de execução por família de técnica. O acervo descreve cada
 * técnica individualmente (`desc`); estes pontos valem para todo o grupo e
 * servem de checklist na hora de treinar.
 */
const PRINCIPIOS_POR_TIPO: Record<string, string[]> = {
  Tsuki: [
    "O punho parte do quadril e gira apenas no fim do trajeto.",
    "Hikite simultâneo: o braço oposto recolhe com a mesma força.",
    "Kime no impacto, seguido de relaxamento imediato.",
  ],
  Uchi: [
    "A trajetória é circular — o cotovelo guia o movimento.",
    "A superfície de impacto entra firme e sai pelo mesmo caminho.",
    "Ombros baixos: a força vem do tronco, não do braço.",
  ],
  Keri: [
    "Hikiashi: o joelho sobe primeiro e recolhe antes de apoiar.",
    "O pé de apoio pivota para acompanhar o quadril.",
    "Postura ereta — o tronco não compensa para trás.",
  ],
  Uke: [
    "Defender é redirecionar, não bloquear de frente.",
    "A rotação do quadril chega antes do antebraço.",
    "A mão de apoio protege a linha central durante o percurso.",
  ],
  Dachi: [
    "Distribuição de peso correta antes de qualquer técnica de braço.",
    "Joelhos ativos e pés enraizados no solo.",
    "Coluna alinhada: a altura do quadril não oscila no deslocamento.",
  ],
};

const slug = (nome: string) =>
  nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function TecnicaModal({
  tecnica,
  onClose,
}: {
  tecnica: Tecnica | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={tecnica !== null}
      onClose={onClose}
      titulo={tecnica ? `${tecnica.nome} — ${tecnica.pt}` : undefined}
    >
      {tecnica ? <TecnicaDetalhe tecnica={tecnica} /> : null}
    </Modal>
  );
}

export function TecnicaDetalhe({
  tecnica,
  compacto = false,
}: {
  tecnica: Tecnica;
  compacto?: boolean;
}) {
  const principios = PRINCIPIOS_POR_TIPO[tecnica.tipo] ?? [];
  const identificador = slug(tecnica.nome);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{tecnica.cat}</Badge>
        <Badge>{tecnica.tipo}</Badge>
        <span className="text-xs text-subtle">{tecnica.kanji}</span>
      </div>

      {compacto ? (
        <div>
          <p className="label">Tradução</p>
          <p className="mt-1 text-xs text-accent">{tecnica.pt}</p>
        </div>
      ) : null}

      <div>
        <p className="label">Descrição</p>
        <p className="mt-1 text-sm leading-relaxed text-fg/85">
          {tecnica.desc}
        </p>
      </div>

      {principios.length > 0 ? (
        <div>
          <p className="label">Pontos de execução — família {tecnica.tipo}</p>
          <ul className="mt-1.5 space-y-1.5">
            {principios.map((principio) => (
              <li
                key={principio}
                className="flex gap-2 text-xs leading-relaxed text-muted"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {principio}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Espaços reservados para a mídia da técnica */}
      <div className={cn("grid gap-3", compacto ? "grid-cols-2" : "sm:grid-cols-2")}>
        <SlotMidia
          titulo="Imagem"
          legenda="Foto de execução"
          caminho={`/images/tecnicas/${identificador}.jpg`}
        />
        <SlotMidia
          titulo="GIF"
          legenda="Movimento em sequência"
          caminho={`/images/tecnicas/${identificador}.gif`}
        />
      </div>
    </div>
  );
}

function SlotMidia({
  titulo,
  legenda,
  caminho,
}: {
  titulo: string;
  legenda: string;
  caminho: string;
}) {
  return (
    <figure>
      <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-line-strong bg-elevated px-3 text-center">
        <div>
          <p className="text-2xs font-medium text-muted">{titulo}</p>
          <p className="mt-1 break-all font-mono text-[10px] leading-tight text-subtle">
            {caminho}
          </p>
        </div>
      </div>
      <figcaption className="mt-1 text-2xs text-subtle">{legenda}</figcaption>
    </figure>
  );
}
