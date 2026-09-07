"use client";

import { useState } from "react";
import { CadastroAlunoPanel } from "@/components/portal/CadastroAlunoPanel";
import { DiarioPanel } from "@/components/portal/DiarioPanel";
import { FinanceiroPanel } from "@/components/portal/FinanceiroPanel";
import { TurmasPanel } from "@/components/portal/TurmasPanel";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { Badge } from "@/components/ui/Badge";
import { SegmentedControl } from "@/components/ui/Tabs";
import { useAcademia } from "@/lib/academiaStore";

type Aba = "turmas" | "diario" | "financeiro" | "cadastro";

const ABAS = [
  { value: "turmas" as const, label: "Turmas" },
  { value: "diario" as const, label: "Diário de classe" },
  { value: "financeiro" as const, label: "Financeiro" },
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
    <>
      <HeroPagina
        compacto
        sobretitulo="Portal do Professor"
        titulo={professor?.nome ?? sessao?.nome ?? ""}
        descricao="Turmas, plano de aulas, chamada e cadastro de alunos."
        imagem="/imagens/dojo.jpg"
        acao={
          professor ? (
            <Badge tone="accent">{professor.graduacao}</Badge>
          ) : undefined
        }
      />

      {/*
        A faixa segura a barra de abas, e não o conteúdo: o painel muda a cada
        aba, então não existe fluxo vertical de seções para alternar. A única
        fronteira estável aqui é entre a abertura e a área de trabalho.
      */}
      <div className="faixa-destacada py-3">
        <div className="section">
          <SegmentedControl options={ABAS} value={aba} onChange={setAba} />
        </div>
      </div>

      <div className="section space-y-4 py-6">

      {aba === "turmas" ? (
        <TurmasPanel />
      ) : aba === "diario" ? (
        <DiarioPanel />
      ) : aba === "financeiro" ? (
        <FinanceiroPanel />
      ) : (
        <CadastroAlunoPanel />
      )}
      </div>
    </>
  );
}
