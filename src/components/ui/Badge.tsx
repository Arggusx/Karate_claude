import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { NivelKata, StatusPagamento } from "@/types";

type Tone = "neutral" | "accent" | "ok" | "warn" | "bad";

const TONES: Record<Tone, string> = {
  neutral: "border-line bg-elevated text-muted",
  accent: "border-accent/30 bg-accent/10 text-accent",
  ok: "border-status-ok/30 bg-status-ok/10 text-status-ok",
  warn: "border-status-warn/30 bg-status-warn/10 text-status-warn",
  bad: "border-status-bad/30 bg-status-bad/10 text-status-bad",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 text-2xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Tag do nível de dificuldade do kata.
 *
 * O acervo traz cinco rótulos ("Iniciante", "Intermediário-Avançado",
 * "Especialista"...), mas eles se agrupam em três degraus reais — que é o que
 * a cor comunica. O texto continua sendo o rótulo original, mais preciso.
 */
const NIVEL_TOM: Record<NivelKata, string> = {
  basico: "border-status-ok/40 bg-status-ok/10 text-status-ok",
  intermediario: "border-status-warn/40 bg-status-warn/10 text-status-warn",
  avancado: "border-accent/40 bg-accent/10 text-accent",
};

export function NivelTag({
  nivel,
  children,
  className,
}: {
  nivel: NivelKata;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-2xs font-medium",
        NIVEL_TOM[nivel],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_MAP: Record<StatusPagamento, { tone: Tone; label: string }> = {
  ativo: { tone: "ok", label: "Ativo" },
  pendente: { tone: "warn", label: "Pendente" },
  atrasado: { tone: "bad", label: "Atrasado" },
};

export function StatusBadge({ status }: { status: StatusPagamento }) {
  const { tone, label } = STATUS_MAP[status];
  return (
    <Badge tone={tone}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

/** Badge com a cor real da faixa — idêntica nos temas claro e escuro. */
export function BeltBadge({
  cor,
  children,
  className,
}: {
  cor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded border border-line bg-elevated py-0.5 pl-1.5 pr-2 text-2xs font-medium text-fg",
        className,
      )}
    >
      <span
        className="h-2.5 w-2.5 rounded-sm ring-1 ring-inset ring-black/20"
        style={{ backgroundColor: cor }}
      />
      {children}
    </span>
  );
}
