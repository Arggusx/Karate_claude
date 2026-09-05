import Link from "next/link";
import {
  MenuMobile,
  MenuMobileLink,
  MenuMobileSeparador,
} from "@/components/layout/MenuMobile";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";

const LINKS = [
  { href: "#beneficios", label: "Benefícios" },
  { href: "#pilares", label: "Pilares" },
  { href: "#dojo", label: "O Dojo" },
  { href: "#matricula", label: "Mensalidade" },
  { href: "/estudos", label: "Portal de Estudos" },
];

export function HeaderLanding() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="section flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-2xs font-semibold text-white">
              松
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em] text-fg">
              Portal Shotokan
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-2.5 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink
            href="/login"
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Entrar
          </ButtonLink>
          <ButtonLink href="#matricula" size="sm" className="hidden sm:inline-flex">
            Matricule-se
          </ButtonLink>

          <MenuMobile className="lg:hidden" rotulo="Abrir menu do site">
            {LINKS.map((link) => (
              <MenuMobileLink key={link.href} href={link.href}>
                {link.label}
              </MenuMobileLink>
            ))}
            <MenuMobileSeparador />
            <MenuMobileLink href="#matricula">Matricule-se</MenuMobileLink>
            <MenuMobileLink href="/login">Entrar no portal</MenuMobileLink>
          </MenuMobile>
        </div>
      </div>
    </header>
  );
}
