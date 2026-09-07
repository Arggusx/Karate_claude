import type { Metadata } from "next";
import {
  ArvoreGenealogica,
  FichasMestres,
} from "@/components/historia/LineageTree";
import { HeroPagina } from "@/components/layout/HeroPagina";
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
    <>
      <HeroPagina
        sobretitulo="História · 歴史"
        titulo="De Okinawa ao mundo: a linhagem do Shotokan"
        imagem="/imagens/historia.jpg"
        kanji="歴史"
        descricao={
          <>
            {timeline.length} marcos históricos e {mestres.length} mestres
            catalogados. Conhecer essa trajetória muda a forma como se executa
            cada kata.
          </>
        }
      />

      <div className="section space-y-10 py-10">
        <section className="space-y-4">
        <SectionHeading
          eyebrow="Seção I"
          titulo="Linha do tempo"
          descricao="Clique em um marco para abrir o contexto histórico completo."
        />
        <LinhaDoTempo marcos={timeline} />
      </section>

      </div>

      {/* Faixa separando a linha do tempo (acima) dos preceitos (abaixo). */}
      <section className="faixa-destacada py-12">
        <div className="section space-y-4">
          <SectionHeading
            eyebrow="Seção II · Keifu 系譜"
            titulo="Árvore genealógica completa"
            descricao="A sucessão de mestres que levou a arte de Shuri aos dojos contemporâneos, com as organizações fundadas por cada linha."
          />
          <ArvoreGenealogica />
          <FichasMestres mestres={mestres} />
        </div>
      </section>

      <div className="section space-y-10 py-10">
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
    </>
  );
}
