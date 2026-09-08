import type { Metadata } from "next";
import {
  ArvoreGenealogica,
  FichasMestres,
  LINHAGEM_BRASIL,
  LINHAGEM_JAPAO,
  LINHAGEM_OKINAWA,
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
            titulo="A linhagem, do Japão ao mundo"
            descricao="A sucessão de mestres que levou a arte de Shuri aos dojos contemporâneos. Em três recortes, porque uma árvore só chegava a cinco níveis de recuo e ninguém conseguia seguir quem vinha de quem."
          />

          <ArvoreGenealogica
            raiz={LINHAGEM_OKINAWA}
            titulo="1 · As raízes em Okinawa"
            legenda="Séculos XIX e XX"
            rodape="Asato e Itosu formaram Funakoshi em conjunto — não é uma linha única. A árvore os mostra lado a lado, e a descendência segue por Itosu apenas para manter a leitura vertical."
          />

          <ArvoreGenealogica
            raiz={LINHAGEM_JAPAO}
            titulo="2 · Do fundador ao mundo"
            legenda="Os discípulos diretos e onde cada um plantou"
            rodape="Todos os nomes deste nível treinaram diretamente com Funakoshi. As organizações entre parênteses foram fundadas por eles depois — várias nasceram de discordâncias sobre o rumo esportivo do estilo."
          />

          <FichasMestres mestres={mestres} />
        </div>
      </section>

      <div className="section space-y-10 py-10">
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Seção III · Burajiru 伯国"
            titulo="Chegada ao Brasil"
            descricao="Entre 1955 e 1972, mestres japoneses desembarcam em ondas e fundam as linhagens de onde descende a maior parte do Shotokan brasileiro — de Harada, que veio trabalhar num banco, a Okuda, enviado oficialmente pela JKA."
          />
          <ArvoreGenealogica
            raiz={LINHAGEM_BRASIL}
            titulo="3 · Ramificações no Brasil"
            legenda="1955 a 1972"
            rodape="Datas e cidades conferidas em fontes independentes. Existem outras linhagens importantes além destas — a primeira geração chegou em grupo, e nem todos os nomes ficaram registrados."
          />
        </section>

        <section className="card overflow-hidden">
          <div className="border-b border-line px-4 py-2.5">
            <h3 className="heading-md">JKA e Shotokan não são a mesma coisa</h3>
            <p className="mt-0.5 text-xs text-muted">
              Os dois nomes andam juntos com tanta frequência que viram
              sinônimo — e não são.
            </p>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-2">
            <div className="bg-surface p-4">
              <p className="text-sm font-semibold text-fg">
                JKA
                <span className="ml-2 text-2xs font-normal text-subtle">
                  Japan Karate Association
                </span>
              </p>
              <p className="mt-1 text-2xs uppercase tracking-[0.08em] text-gold">
                Uma organização
              </p>
              <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted">
                <li>Fundada em 1949, no Japão, com sede em Tóquio.</li>
                <li>Tem regras, exames e certificações próprias.</li>
                <li>Existe para padronizar o ensino e preservar o método.</li>
              </ul>
            </div>
            <div className="bg-surface p-4">
              <p className="text-sm font-semibold text-fg">
                Shotokan
                <span className="ml-2 text-2xs font-normal text-subtle">
                  松濤館
                </span>
              </p>
              <p className="mt-1 text-2xs uppercase tracking-[0.08em] text-gold">
                Um estilo
              </p>
              <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-muted">
                <li>É o karatê que nasce de Gichin Funakoshi.</li>
                <li>Várias organizações e escolas ensinam Shotokan.</li>
                <li>
                  Nem todo Shotokan pertence à JKA — mas a JKA ensina Shotokan.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

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
