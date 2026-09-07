import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { HeaderLanding } from "@/components/layout/HeaderLanding";
import { HeroLanding } from "@/components/layout/HeroLanding";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { listarTurmas } from "@/server/usuarios";
import { VALOR_MENSALIDADE_CENTAVOS } from "@/server/pagamentos";
import {
  dados,
  getBeneficios,
  getDepoimentos,
  getKatas,
  getPilares,
  formatarReais,
  getTecnicas,
} from "@/services/dataService";

const INCLUSO = [
  "Três aulas por semana, terça, quinta e sexta",
  "Acesso integral ao portal de estudos",
  "Acompanhamento individual do sensei",
  "Exames de graduação sem custo extra",
];

/**
 * A página é gerada estaticamente e revalidada a cada 5 minutos. Sem isso, os
 * horários das turmas ficariam congelados no momento do build — e um build
 * feito sem banco (ex.: preview sem env) publicaria a lista vazia para sempre.
 */
export const revalidate = 300;

export default async function LandingPage() {
  // Turmas e horários vêm do banco — é o mesmo dado que o portal usa.
  // Se o banco não responder, a página ainda sobe sem a grade de horários.
  const turmas = await listarTurmas().catch(() => []);
  const beneficios = getBeneficios();
  const pilares = getPilares();
  const depoimentos = getDepoimentos();
  const katas = getKatas();
  const tecnicas = getTecnicas();

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderLanding />

      <main className="flex-1">
        <HeroLanding katas={katas.length} tecnicas={tecnicas.length} />

        {/* Turmas e horários */}
        <section className="border-b border-line bg-surface">
          <div className="section grid gap-8 py-14 lg:grid-cols-[1.25fr_1fr] lg:py-16">
            <div className="max-w-xl">
              <Badge tone="accent">Dojo Shotokan · desde 1998</Badge>
              <h2 className="mt-4 font-display text-3xl font-normal leading-tight tracking-[-0.02em] text-fg">
                Duas turmas, um mesmo método
              </h2>
              <p className="body-muted mt-3 text-sm">
                A divisão é por faixa etária, não por nível: a técnica é a
                mesma, o ritmo é que muda. A primeira aula é experimental e
                gratuita.
              </p>
            </div>

            {/* Horários */}
            <div className="card self-start">
              <div className="border-b border-line px-4 py-2.5">
                <h2 className="heading-md">Turmas e horários</h2>
              </div>
              <ul className="divide-y divide-line">
                {turmas.map((turma) => (
                  <li key={turma.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-fg">
                        {turma.nome}
                      </span>
                      <span className="text-xs tabular-nums text-muted">
                        {turma.horario.slice(0, 5)} às{" "}
                        {(turma.hora_fim ?? "").slice(0, 5)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-2xs text-subtle">
                      {turma.faixa_etaria} · {turma.dias_semana}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line px-4 py-3">
                <p className="text-2xs text-subtle">
                  Primeira aula experimental gratuita.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section id="beneficios" className="section scroll-mt-16 py-12">
          <SectionHeading
            eyebrow="Benefícios"
            titulo="O que o treino constrói"
            descricao="Seis efeitos do karatê que aparecem fora do tatame."
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {beneficios.map((beneficio) => (
              <article
                key={beneficio.titulo}
                className="card card-hover relative overflow-hidden p-4"
              >
                <span
                  aria-hidden
                  className="kanji-mark absolute right-3 top-2 text-4xl"
                >
                  {beneficio.kanji}
                </span>
                <h3 className="heading-md">{beneficio.titulo}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {beneficio.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Pilares */}
        {/* Faixa separando os benefícios (acima) da apresentação do dojo. */}
        <section
          id="pilares"
          className="faixa-destacada scroll-mt-16 py-12"
        >
          <div className="section">
          <SectionHeading
            eyebrow="Método"
            titulo="Kihon, Kata e Kumite"
            descricao="As três frentes de trabalho que estruturam cada aula."
          />

          <div className="mt-4 grid gap-2 lg:grid-cols-3">
            {pilares.map((pilar) => (
              <article key={pilar.nome} className="card p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="heading-md">{pilar.nome}</h3>
                  <span className="text-xs text-subtle">{pilar.kanji}</span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-accent">
                  {pilar.pt}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-fg/85">
                  {pilar.tagline}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {pilar.para_que_serve}
                </p>
              </article>
            ))}
          </div>
          </div>
        </section>

        {/* Dojo */}
        <section
          id="dojo"
          className="scroll-mt-16 border-y border-line bg-surface py-12"
        >
          <div className="section grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="eyebrow">O Dojo</p>
              <h2 className="heading-lg mt-1.5">
                Um espaço construído para o treino sério
              </h2>
              <p className="body-muted mt-3">
                180 m² de tatame oficial, vestiários completos, sala de
                preparação física e uma parede dedicada à linhagem dos mestres.
                Turmas separadas por faixa etária e nível, com no máximo 20
                alunos por aula para garantir correção individual.
              </p>
              <p className="body-muted mt-3">
                A equipe técnica é formada por faixas pretas graduadas em
                linhagem direta da JKA, com atualização anual obrigatória.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href="#matricula">Ver mensalidade</ButtonLink>
                <ButtonLink href="/estudos/historia" variant="ghost">
                  Conhecer a linhagem →
                </ButtonLink>
              </div>
            </div>

            <div className="card">
              <div className="border-b border-line px-4 py-2.5">
                <h3 className="heading-md">Quem já treina aqui</h3>
              </div>
              <ul className="divide-y divide-line">
                {depoimentos.map((depoimento) => (
                  <li key={depoimento.nome} className="px-4 py-3">
                    <p className="text-sm font-medium text-fg">
                      {depoimento.nome}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      <span className="font-medium text-subtle">Antes:</span>{" "}
                      {depoimento.antes}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-fg/85">
                      <span className="font-medium text-accent">Depois:</span>{" "}
                      {depoimento.depois}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Mensalidade */}
        <section id="matricula" className="section scroll-mt-16 py-12">
          <SectionHeading
            eyebrow="Matrícula"
            titulo="Um valor único, para qualquer idade"
            descricao="Sem planos, sem pacotes e sem taxa de matrícula. A mesma mensalidade vale para as duas turmas."
          />

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
            <article className="card border-accent p-5">
              <p className="label">Mensalidade</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-sm text-muted">R$</span>
                <span className="text-5xl font-semibold tabular-nums tracking-[-0.03em] text-fg">
                  {formatarReais(VALOR_MENSALIDADE_CENTAVOS)}
                </span>
                <span className="text-sm text-muted">/mês</span>
              </p>
              <p className="mt-2 text-xs text-muted">
                Mesmo valor para infantil e avançado, de qualquer faixa.
              </p>

              <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                {INCLUSO.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs text-fg/85"
                  >
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>

              <ButtonLink href="/login" size="sm" className="mt-5 w-full">
                Quero me matricular
              </ButtonLink>
            </article>

            <div className="card">
              <div className="border-b border-line px-4 py-2.5">
                <h3 className="heading-md">As duas turmas</h3>
                <p className="mt-0.5 text-xs text-muted">
                  A divisão formal é por nível e faixa; na prática, a idade é o
                  critério do dia a dia.
                </p>
              </div>
              <ul className="divide-y divide-line">
                {turmas.map((turma) => (
                  <li key={turma.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-fg">
                        Turma {turma.nome}
                      </span>
                      <Badge>{turma.faixa_etaria}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {turma.dias_semana} · {turma.horario.slice(0, 5)} às{" "}
                      {(turma.hora_fim ?? "").slice(0, 5)}
                    </p>
                    <p className="mt-0.5 text-2xs text-subtle">
                      Faixas típicas: {turma.faixas_tipicas}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="border-t border-line px-4 py-3 text-2xs text-subtle">
                Primeira semana de aulas gratuita para novos alunos.
              </p>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Acervo do portal atualizado em {dados.exportadoEm.slice(0, 10)}.{" "}
            <Link href="/login" className="text-accent hover:underline">
              Já é aluno? Acesse seu portal.
            </Link>
          </p>
        </section>

      </main>

      <Footer />
    </div>
  );
}
