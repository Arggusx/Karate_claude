import type { Metadata } from "next";
import {
  ArvoreGenealogica,
  FichasMestres,
} from "@/components/historia/LineageTree";
import { LinhaDoTempo } from "@/components/historia/Timeline";
import { SectionHeading } from "@/components/ui/Card";
import {
  getMestres,
  getPreceitosFunakoshi,
  getTimeline,
} from "@/services/dataService";

export const metadata: Metadata = {
  title: "História",
  description:
    "Linha do tempo do Karatê Shotokan e a árvore genealógica dos mestres.",
};

export default function HistoriaPage() {
  const timeline = getTimeline();
  const mestres = getMestres();
  const preceitos = getPreceitosFunakoshi();

  return (
    <div className="section space-y-10">
      <header className="border-b border-line pb-5">
        <p className="eyebrow">História · 歴史</p>
        <h1 className="heading-xl mt-1.5">
          De Okinawa ao mundo: a linhagem do Shotokan
        </h1>
        <p className="body-muted mt-2 max-w-3xl">
          {timeline.length} marcos históricos e {mestres.length} mestres
          catalogados. Conhecer essa trajetória muda a forma como se executa
          cada kata.
        </p>
      </header>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Seção I"
          titulo="Linha do tempo"
          descricao="Clique em um marco para abrir o contexto histórico completo."
        />
        <LinhaDoTempo marcos={timeline} />
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Seção II · Keifu 系譜"
          titulo="Árvore genealógica completa"
          descricao="A sucessão de mestres que levou a arte de Shuri aos dojos contemporâneos, com as organizações fundadas por cada linha."
        />
        <ArvoreGenealogica />
        <FichasMestres mestres={mestres} />
      </section>

      <section className="card p-5">
        <p className="eyebrow">Preceitos de Gichin Funakoshi</p>
        <ul className="mt-3 space-y-2">
          {preceitos.map((preceito) => (
            <li
              key={preceito}
              className="border-l-2 border-accent pl-3 text-sm leading-relaxed text-fg/85"
            >
              {preceito}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
