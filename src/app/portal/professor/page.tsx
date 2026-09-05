"use client";

import { useState } from "react";
import { CadastroAlunoPanel } from "@/components/portal/CadastroAlunoPanel";
import { DiarioPanel } from "@/components/portal/DiarioPanel";
import { ResumoAcademia } from "@/components/portal/ResumoAcademia";
import { TurmasPanel } from "@/components/portal/TurmasPanel";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { Badge } from "@/components/ui/Badge";
import { SegmentedControl } from "@/components/ui/Tabs";
import { useAcademia } from "@/lib/academiaStore";

type Aba = "turmas" | "diario" | "cadastro";

const ABAS = [
  { value: "turmas" as const, label: "Turmas" },
  { value: "diario" as const, label: "Diário de classe" },
  { value: "cadastro" as const, label: "Cadastro" },
];

export default function PortalProfessorPage() {
  return (
    <GuardaPortal perfis={["professor"]}>
      <ConteudoProfessor />
    </GuardaPortal>
  );
}

function ConteudoProfessor() {
  const { professores, sessao } = useAcademia();
  const [aba, setAba] = useState<Aba>("turmas");

  const professor = professores.find((item) => item.id === sessao?.id);

  return (
    <div className="section space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="eyebrow">Portal do Professor</p>
          <h1 className="heading-lg mt-1">{professor?.nome ?? sessao?.nome}</h1>
          <p className="mt-1 text-xs text-muted">
            Turmas, plano de aulas, chamada e cadastro de alunos.
          </p>
        </div>
        {professor ? <Badge tone="accent">{professor.graduacao}</Badge> : null}
      </header>

      <ResumoAcademia />

      <SegmentedControl options={ABAS} value={aba} onChange={setAba} />

      {aba === "turmas" ? (
        <TurmasPanel />
      ) : aba === "diario" ? (
        <DiarioPanel />
      ) : (
        <CadastroAlunoPanel />
      )}
    </div>
  );
}
