"use client";

import { useAcademia } from "@/lib/academiaStore";
import { formatarReais } from "@/services/dataService";

/** Faixa de indicadores compartilhada pelos portais do professor e do admin. */
export function ResumoAcademia({ comFinanceiro = false }: { comFinanceiro?: boolean }) {
  const { turmas, alunos, mensalidadeCentavos } = useAcademia();

  const pendentes = alunos.filter((aluno) => aluno.status !== "ativo").length;
  const frequencia = alunos.length
    ? Math.round(
        alunos.reduce((total, aluno) => total + aluno.frequencia, 0) /
          alunos.length,
      )
    : 0;

  const itens = [
    { label: "Turmas ativas", valor: String(turmas.length) },
    { label: "Alunos matriculados", valor: String(alunos.length) },
    { label: "Frequência média", valor: `${frequencia}%` },
    { label: "Pagamentos pendentes", valor: String(pendentes) },
  ];

  if (comFinanceiro) {
    itens.push({
      label: "Receita prevista",
      valor: `R$ ${formatarReais(alunos.length * mensalidadeCentavos)}`,
    });
  }

  return (
    <section
      className={`card grid grid-cols-2 divide-x divide-y divide-line lg:divide-y-0 ${
        comFinanceiro ? "lg:grid-cols-5" : "lg:grid-cols-4"
      }`}
    >
      {itens.map((item) => (
        <div key={item.label} className="px-4 py-3">
          <p className="text-2xs uppercase tracking-[0.08em] text-muted">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-fg">
            {item.valor}
          </p>
        </div>
      ))}
    </section>
  );
}
