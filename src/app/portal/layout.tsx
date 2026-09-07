import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { SessaoHeader } from "@/components/portal/SessaoHeader";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="section flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-2xs font-semibold text-white">
              松
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em] text-fg">
              Portal Shotokan
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <SessaoHeader />
            <ThemeToggle />
            <ButtonLink href="/estudos" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Portal de estudos
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* Ver comentário em estudos/layout.tsx: o hero de cada página encosta
          no header, então o padding do topo sai daqui. */}
      <main className="flex-1 pb-8">{children}</main>
      <Footer />
    </div>
  );
}
