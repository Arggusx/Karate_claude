import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Table({
  children,
  minWidth = "min-w-[920px]",
}: {
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table
          className={cn("w-full border-collapse text-left text-sm", minWidth)}
        >
          {children}
        </table>
      </div>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="border-b border-line bg-elevated">{children}</thead>;
}

export function TH({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap px-3 py-2 text-2xs font-medium uppercase tracking-[0.08em] text-muted",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TR({ children }: { children: ReactNode }) {
  return (
    <tr className="transition-colors duration-150 hover:bg-elevated">
      {children}
    </tr>
  );
}

export function TD({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-3 py-2.5 align-middle text-fg/85", className)}>
      {children}
    </td>
  );
}
