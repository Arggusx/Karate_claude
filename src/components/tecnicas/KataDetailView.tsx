import Link from "next/link";
import { EmbusenImage } from "@/components/tecnicas/EmbusenImage";
import { Badge, BeltBadge } from "@/components/ui/Badge";
import { listarDestaques } from "@/services/dataService";
import type { KataCompleto } from "@/types";

export function KataDetailView({
  kata,
  anterior,
  proximo,
}: {
  kata: KataCompleto;
  anterior: KataCompleto | null;
  proximo: KataCompleto | null;
}) {
  const ficha = [
    { label: "Movimentos", valor: String(kata.quantidadeMovimentos) },
    { label: "Kiais", valor: kata.posicoesKiai },
    { label: "Categoria", valor: kata.categoria },
    { label: "Dificuldade", valor: kata.nivelDificuldade },
  ];

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="card p-5">
        <Link
          href="/estudos/tecnicas"
          className="text-xs text-muted transition-colors hover:text-fg"
        >
          ← Técnicas
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="accent">{kata.categoria}</Badge>
          <BeltBadge cor={kata.corFaixa}>{kata.faixaRecomendada}</BeltBadge>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <h1 className="heading-xl">{kata.nome}</h1>
          {kata.kanji ? (
            <span className="text-lg text-subtle">{kata.kanji}</span>
          ) : null}
        </div>
        <p className="mt-1.5 text-sm font-medium text-accent">
          {kata.significadoNome}
        </p>

        {kata.resumo ? (
          <>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-fg/85">
              {kata.resumo.text}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {kata.resumo.decomposicao.map((parte) => (
                <span
                  key={parte.termo}
                  className="rounded border border-line bg-elevated px-2 py-1 text-2xs text-muted"
                >
                  <span className="font-medium text-fg">{parte.termo}</span> ·{" "}
                  {parte.significado}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Ficha técnica */}
      <div className="card grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
        {ficha.map((item) => (
          <div key={item.label} className="px-4 py-3">
            <p className="label">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-fg">{item.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Vídeo */}
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Vídeo demonstrativo</h2>
            <span className="text-2xs text-subtle">YouTube</span>
          </div>
          <div className="relative aspect-video w-full bg-elevated">
            {kata.videoUrl ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={kata.videoUrl}
                title={`Kata ${kata.nome} — demonstração`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-muted">Vídeo não cadastrado.</p>
              </div>
            )}
          </div>
        </section>

        {/* Embusen */}
        <section className="card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Embusen</h2>
            <span className="text-2xs text-subtle">Linha de atuação</span>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <EmbusenImage
              src={kata.embusenOficialImg}
              alt={`Embusen oficial do kata ${kata.nome}`}
              legenda="Oficial"
            />
            <EmbusenImage
              src={kata.embusenCompletoImg}
              alt={`Embusen completo do kata ${kata.nome}`}
              legenda="Completo"
            />
          </div>
        </section>
      </div>

      {/* Destaques + bunkai */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Técnicas destaque</h2>
          </div>
          <div className="flex flex-wrap gap-1.5 p-4">
            {listarDestaques(kata).map((destaque) => (
              <span
                key={destaque}
                className="rounded border border-line bg-elevated px-2 py-1 text-xs text-fg/85"
              >
                {destaque}
              </span>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Bunkai — aplicações</h2>
          </div>
          <ul className="divide-y divide-line">
            {kata.bunkai.map((aplicacao, index) => (
              <li key={index} className="flex gap-2.5 px-4 py-2.5">
                <span className="text-2xs font-medium tabular-nums text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xs leading-relaxed text-fg/85">
                  {aplicacao}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Sequência de movimentos */}
      <section className="card">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <h2 className="heading-md">Sequência de movimentos</h2>
          <span className="text-2xs tabular-nums text-subtle">
            {kata.movimentos.length} passos
          </span>
        </div>
        <ol className="divide-y divide-line md:grid md:grid-cols-2 md:divide-y-0">
          {kata.movimentos.map((movimento, index) => (
            <li
              key={index}
              className="border-line px-4 py-2 text-xs leading-relaxed text-fg/85 md:border-b md:odd:border-r"
            >
              {movimento}
            </li>
          ))}
        </ol>
      </section>

      {/* Navegação sequencial */}
      <nav className="grid gap-3 sm:grid-cols-2">
        {anterior ? (
          <Link
            href={`/estudos/tecnicas/kata/${anterior.id}`}
            className="card card-hover px-4 py-3"
          >
            <p className="text-2xs text-muted">← Kata anterior</p>
            <p className="mt-0.5 text-sm font-semibold text-fg">
              {anterior.nome}
            </p>
          </Link>
        ) : (
          <div className="card px-4 py-3 opacity-50">
            <p className="text-2xs text-muted">← Kata anterior</p>
            <p className="mt-0.5 text-sm font-semibold text-fg">
              Início da sequência
            </p>
          </div>
        )}

        {proximo ? (
          <Link
            href={`/estudos/tecnicas/kata/${proximo.id}`}
            className="card card-hover px-4 py-3 text-right"
          >
            <p className="text-2xs text-muted">Próximo kata →</p>
            <p className="mt-0.5 text-sm font-semibold text-fg">
              {proximo.nome}
            </p>
          </Link>
        ) : (
          <div className="card px-4 py-3 text-right opacity-50">
            <p className="text-2xs text-muted">Próximo kata →</p>
            <p className="mt-0.5 text-sm font-semibold text-fg">
              Fim da sequência
            </p>
          </div>
        )}
      </nav>
    </div>
  );
}
