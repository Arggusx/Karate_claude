import { Footer } from "@/components/layout/Footer";
import { HeaderEstudos } from "@/components/layout/HeaderEstudos";

export default function EstudosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderEstudos />
      {/*
        Sem padding no topo: a faixa escura de abertura de cada página encosta
        no header. O respiro do conteúdo vem do padding interno da própria
        página, logo abaixo do hero.
      */}
      <main className="flex-1 pb-10">{children}</main>
      <Footer />
    </div>
  );
}
