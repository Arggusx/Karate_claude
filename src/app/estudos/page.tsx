import Link from "next/link";
import type { Metadata } from "next";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import {
  dados,
  getCuriosidades,
  getDicionario,
  getKatas,
  getPilares,
  getTecnicas,
} from "@/services/dataService";

export const metadata: Metadata = {
  title: "Portal de Estudos",
  description:
    "Os três pilares do estudo do Karatê Shotokan: história, técnicas e fundamentos.",
};

const PILARES_NAV = [
  {
    href: "/estudos/historia",
    kanji: "歴史",
    titulo: "História",
    subtitulo: "Linhagem e Mestres",
    descricao:
      "Linha do tempo de Okinawa aos dias atuais e a árvore de transmissão dos mestres, de Matsumura aos dojos brasileiros.",
  },
  {
    href: "/estudos/tecnicas",
    kanji: "技術",
    titulo: "Técnicas",
    subtitulo: "Kihon e Katas",
    descricao:
      "Socos, chutes, defesas e bases catalogados, mais o repertório de katas com ficha técnica, bunkai e sequência de movimentos.",
  },
  {
    href: "/estudos/fundamentos",
    kanji: "基本",
    titulo: "Fundamentos",
    subtitulo: "Graduação e Filosofia",
    descricao:
      "Sistema de faixas, Dojo Kun, Niju Kun, etiqueta do dojo e os princípios técnicos que sustentam a execução.",
  },
];

export default function EstudosHomePage() {
  const katas = getKatas();
  const tecnicas = getTecnicas();
  const pilares = getPilares();
  const curiosidades = getCuriosidades().slice(0, 4);
  const dicionario = getDicionario();

  const numeros = [
    { valor: String(katas.length), label: "Katas detalhados" },
    { valor: String(tecnicas.length), label: "Técnicas de kihon" },
    { valor: String(dados.mestres.length), label: "Mestres na linhagem" },
    { valor: String(dados.timeline.length), label: "Marcos históricos" },
    { valor: String(dados.graduacoes.length), label: "Graduações" },
    { valor: String(dados.principiosTecnicos.length), label: "Princípios" },
  ];

  return (
    <>
      <HeroPagina
        sobretitulo="Portal de Estudos"
        titulo="O acervo completo do Shotokan, organizado em três pilares"
        imagem="/imagens/estudos.jpg"
        opacidadeImagem={0.4}
        descricao={
          <>
            Todo o conteúdo desta área vem do acervo do dojo — {katas.length}{" "}
            katas com sequência de movimentos e bunkai, {tecnicas.length}{" "}
            técnicas de kihon e {dados.timeline.length} marcos históricos.
          </>
        }
        acao={
          <div className="flex gap-2">
            <ButtonLink href="/estudos/tecnicas">Ver katas</ButtonLink>
            <ButtonLink
              href="/estudos/historia"
              className="border border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10"
            >
              História
            </ButtonLink>
          </div>
        }
      />

      <div className="section space-y-10 py-10">
      {/* Números do acervo */}
      <section className="card grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {numeros.map((numero) => (
          <div key={numero.label} className="px-4 py-3.5">
            <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em] text-fg">
              {numero.valor}
            </p>
            <p className="mt-0.5 text-2xs uppercase tracking-[0.08em] text-muted">
              {numero.label}
            </p>
          </div>
        ))}
      </section>

      {/* Navegação pelos 3 pilares do portal */}
      <section className="grid gap-3 lg:grid-cols-3">
        {PILARES_NAV.map((pilar) => (
          <Link
            key={pilar.href}
            href={pilar.href}
            className="card card-hover group relative overflow-hidden p-4"
          >
            <span
              aria-hidden
              className="kanji-mark absolute right-3 top-2 text-4xl"
            >
              {pilar.kanji}
            </span>
            <h2 className="heading-md">{pilar.titulo}</h2>
            <p className="mt-0.5 text-xs font-medium text-accent">
              {pilar.subtitulo}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {pilar.descricao}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-fg group-hover:text-accent">
              Acessar →
            </span>
          </Link>
        ))}
      </section>

      </div>

      {/* Os 3 pilares do treino — faixa que separa o bloco de navegação
          do bloco de consulta (dicionário e curiosidades). */}
      <section className="faixa-destacada py-12">
        <div className="section space-y-3">
        <SectionHeading
          eyebrow="Kihon · Kata · Kumite"
          titulo="Os três pilares do treino"
          descricao="Como o acervo define cada frente de trabalho e para que ela serve."
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {pilares.map((pilar) => (
            <article key={pilar.nome} className="card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="heading-md">{pilar.nome}</h3>
                <span className="font-kanji text-sm text-subtle">{pilar.kanji}</span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-accent">
                {pilar.pt}
              </p>
              <p className="mt-2 text-xs italic leading-relaxed text-muted">
                {pilar.tagline}
              </p>
              <dl className="mt-3 space-y-2 border-t border-line pt-3">
                <div>
                  <dt className="label">O que é</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-fg/85">
                    {pilar.oque_e}
                  </dd>
                </div>
                <div>
                  <dt className="label">Para que serve</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-muted">
                    {pilar.para_que_serve}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        </div>
      </section>

      <div className="section space-y-10 py-10">
      {/* Dicionário + curiosidades */}
      <section className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="card">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Dicionário do dojo</h2>
          </div>
          <ul className="divide-y divide-line">
            {dicionario.map((termo) => (
              <li
                key={termo.romaji}
                className="flex items-baseline justify-between gap-3 px-4 py-2.5"
              >
                <span>
                  <span className="text-sm font-medium text-fg">
                    {termo.romaji}
                  </span>
                  <span className="ml-2 font-kanji text-sm text-subtle">{termo.jp}</span>
                </span>
                <span className="text-right text-xs text-muted">
                  {termo.pt}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Curiosidades</h2>
            <span className="text-2xs text-subtle">
              {getCuriosidades().length} no acervo
            </span>
          </div>
          <ul className="divide-y divide-line">
            {curiosidades.map((curiosidade) => (
              <li key={curiosidade.titulo} className="px-4 py-3">
                <p className="text-sm font-medium text-fg">
                  {curiosidade.titulo}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {curiosidade.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      </div>
    </>
  );
}
