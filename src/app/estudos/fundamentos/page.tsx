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
    <div className="section space-y-10">
      <header className="border-b border-line pb-5">
        <p className="eyebrow">Fundamentos · 基本</p>
        <h1 className="heading-xl mt-1.5">Graduação, etiqueta e princípio</h1>
        <p className="body-muted mt-2 max-w-3xl">
          A faixa registra um percurso, não um troféu. Aqui estão as exigências
          de cada graduação e os princípios que dão sentido a cada movimento.
        </p>
      </header>

      {/* Seção 1 — Sistema de faixas */}
      <section className="space-y-4">
        <SectionHeading
          eyebrow="Seção I"
          titulo="Sistema de faixas — Kyu e Dan"
          descricao="Ordem de progressão do 7º Kyu ao 1º Dan, com tempo mínimo recomendado e o programa exigido em cada exame."
        />

        <div className="grid gap-2 md:grid-cols-2">
          {graduacoes.map((faixa) => (
            <article
              key={faixa.id}
              className="card card-hover overflow-hidden border-l-4 p-4"
              style={{ borderLeftColor: faixa.cor }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-6 w-6 rounded ring-1 ring-inset ring-black/20"
                    style={{ backgroundColor: faixa.cor }}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-fg">
                      Faixa {faixa.faixa}
                      <span className="ml-1.5 text-xs font-normal text-subtle">
                        {faixa.jp}
                      </span>
                    </h3>
                    <p className="text-2xs font-medium uppercase tracking-[0.08em] text-accent">
                      {faixa.grau}
                    </p>
                  </div>
                </div>
                <span className="text-2xs text-muted">{faixa.tempoMinimo}</span>
              </div>

              <p className="mt-2.5 text-xs italic leading-relaxed text-muted">
                {faixa.txt}
              </p>

              <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
                <div>
                  <p className="label">Katas exigidos</p>
                  <ul className="mt-1 space-y-0.5">
                    {faixa.katasExigidos.map((kata) => (
                      <li key={kata} className="text-xs text-fg/85">
                        {kata}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="label">Kihon do exame</p>
                  <ul className="mt-1 space-y-0.5">
                    {faixa.kihonExigido.map((tecnica) => (
                      <li key={tecnica} className="text-xs text-muted">
                        {tecnica}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Seção 2 — Filosofia */}
      <section className="space-y-4">
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
      </section>
    </div>
  );
}
