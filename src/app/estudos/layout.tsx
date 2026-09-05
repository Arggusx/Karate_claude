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
      <main className="flex-1 pb-10 pt-12">{children}</main>
      <Footer />
    </div>
  );
}
