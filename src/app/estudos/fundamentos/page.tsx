import { HeroPagina } from "@/components/layout/HeroPagina";
import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/Card";
import {
  getDojoKun,
  getEtiquetaDojo,
  getGraduacoes,
  getNijuKun,
  getPrincipiosTecnicos,
} from "@/services/dataService";

export const metadata: Metadata = {
  title: "Fundamentos",
  description:
    "Sistema de faixas Kyu/Dan, Dojo Kun, Niju Kun, etiqueta e princípios técnicos do Karatê Shotokan.",
};

export default function FundamentosPage() {
  const graduacoes = getGraduacoes();
  const dojoKun = getDojoKun();
  const nijuKun = getNijuKun();
  const principios = getPrincipiosTecnicos();
  const etiqueta = getEtiquetaDojo();

  return (
    <>
      <HeroPagina
        sobretitulo="Fundamentos · 基本"
        titulo="Graduação, etiqueta e princípio"
        descricao="A faixa registra um percurso, não um troféu. Aqui estão as exigências de cada graduação e os princípios que dão sentido a cada movimento."
        imagem="/imagens/faixa.jpg"
        opacidadeImagem={0.8}
        kanji="基本"
      />

      <div className="section space-y-10 py-10">
        {/* Seção 1 — Sistema de faixas */}
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Seção I"
          titulo="Sistema de faixas — Kyu e Dan"
          descricao="Ordem de progressão do 7º Kyu ao 1º Dan, com tempo mínimo recomendado e o programa exigido em cada exame."
        />

        {/*
          Cartões compactos: quatro por linha no desktop. O programa do exame
          virou uma linha corrida em vez de duas listas — a mesma informação
          ocupando um terço da altura, e a sequência de faixas cabe de relance.
        */}
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {graduacoes.map((faixa) => (
            <article
              key={faixa.id}
              className="card card-hover overflow-hidden border-l-[3px] px-2.5 py-2"
              style={{ borderLeftColor: faixa.cor }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm ring-1 ring-inset ring-black/20"
                  style={{ backgroundColor: faixa.cor }}
                />
                <h3 className="min-w-0 flex-1 truncate text-2xs font-semibold text-fg">
                  {faixa.faixa}
                  <span className="ml-1 font-normal text-subtle">
                    {faixa.jp}
                  </span>
                </h3>
                <span className="shrink-0 text-2xs font-medium uppercase tracking-[0.06em] text-accent">
                  {faixa.grau}
                </span>
              </div>

              {/*
                Rótulo à esquerda na mesma linha do valor, em vez de acima:
                economiza três linhas por cartão sem cortar nenhum texto. O
                kihon continua quebrando em quantas linhas precisar.
              */}
              <dl className="mt-1.5 space-y-1 border-t border-line pt-1.5 text-2xs leading-snug">
                <div className="flex gap-2">
                  <dt className="w-9 shrink-0 text-subtle">Tempo</dt>
                  <dd className="min-w-0 flex-1 text-muted">
                    {faixa.tempoMinimo}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-9 shrink-0 text-subtle">Katas</dt>
                  <dd className="min-w-0 flex-1 text-fg/85">
                    {faixa.katasExigidos.join(" · ")}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-9 shrink-0 text-subtle">Kihon</dt>
                  <dd className="min-w-0 flex-1 text-muted">
                    {faixa.kihonExigido.join(" · ")}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      </div>

      {/* Seção 2 — Filosofia. Faixa separando o programa técnico (acima)
          da parte de princípio e etiqueta. */}
      <section className="faixa-destacada py-12">
        <div className="section space-y-4">
        <SectionHeading
          eyebrow="Seção II"
          titulo="Pilares e filosofia do Shotokan"
          descricao="Os códigos recitados no dojo e os conceitos que separam o movimento correto do movimento eficaz."
        />

        {/* Dojo Kun */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h3 className="heading-md">Dojo Kun</h3>
            <span className="text-2xs text-subtle">
              {dojoKun.length} lemas · recitados em seiza
            </span>
          </div>
          <ol className="divide-y divide-line">
            {dojoKun.map((lema, index) => (
              <li key={lema.romaji} className="flex gap-3 px-4 py-3">
                <span className="text-2xs font-medium tabular-nums text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-sm font-medium text-fg">{lema.pt}</p>
                  <p className="mt-0.5 text-2xs text-muted">
                    {lema.romaji} · {lema.jp}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {lema.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Niju Kun */}
        <div className="card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h3 className="heading-md">Niju Kun</h3>
            <span className="text-2xs text-subtle">
              Preceitos de Gichin Funakoshi
            </span>
          </div>
          <ol className="grid divide-line sm:grid-cols-2">
            {nijuKun.map((principio, index) => (
              <li
                key={principio}
                className="border-b border-line px-4 py-2 text-xs leading-relaxed text-fg/85 sm:odd:border-r"
              >
                {principio}
              </li>
            ))}
          </ol>
        </div>

        {/* Etiqueta do dojo */}
        <div className="grid gap-3 lg:grid-cols-3">
          {etiqueta.map((item) => (
            <article key={item.nome} className="card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="heading-md">{item.nome}</h3>
                <span className="text-xs text-subtle">{item.kanji}</span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-accent">
                {item.traducao}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-fg/85">
                {item.oque_e}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {item.para_que_serve}
              </p>
              <dl className="mt-3 space-y-2 border-t border-line pt-3">
                {(item.detalhes ?? []).map((detalhe) => (
                  <div key={detalhe.titulo}>
                    <dt className="text-2xs font-medium text-fg">
                      {detalhe.titulo}
                    </dt>
                    <dd className="mt-0.5 text-xs leading-relaxed text-muted">
                      {detalhe.desc}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        {/* Princípios técnicos */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h3 className="heading-md">Princípios técnicos</h3>
            <span className="text-2xs text-subtle">
              {principios.length} conceitos
            </span>
          </div>
          <div className="grid divide-line sm:grid-cols-2 lg:grid-cols-3">
            {principios.map((principio) => (
              <article
                key={principio.n}
                className="border-b border-line px-4 py-3 lg:[&:nth-child(3n+1)]:border-r lg:[&:nth-child(3n+2)]:border-r"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-sm font-semibold text-fg">
                    {principio.n}
                  </h4>
                  <span className="text-xs text-subtle">{principio.k}</span>
                </div>
                <p className="mt-0.5 text-2xs font-medium uppercase tracking-[0.06em] text-accent">
                  {principio.traducao}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-fg/85">
                  {principio.oque_e}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {principio.para_que_serve}
                </p>
              </article>
            ))}
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
