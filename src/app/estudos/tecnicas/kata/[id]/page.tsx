import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KataDetailView } from "@/components/tecnicas/KataDetailView";
import { getKataPorId, getKataVizinhos, getKatas } from "@/services/dataService";

export function generateStaticParams() {
  return getKatas().map((kata) => ({ id: kata.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const kata = getKataPorId(id);

  if (!kata) return { title: "Kata não encontrado" };

  return {
    title: `${kata.nome} — ${kata.significadoNome}`,
    description: kata.resumo?.text ?? kata.tecnicasDestaque,
  };
}

export default async function KataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kata = getKataPorId(id);

  if (!kata) notFound();

  const { anterior, proximo } = getKataVizinhos(kata.id);

  return (
    <div className="section">
      <KataDetailView kata={kata} anterior={anterior} proximo={proximo} />
    </div>
  );
}
