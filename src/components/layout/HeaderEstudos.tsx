"use client";

import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import { usePathname } from "next/navigation";
import {
  MenuMobile,
  MenuMobileLink,
  MenuMobileSeparador,
} from "@/components/layout/MenuMobile";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/estudos", label: "Home" },
  { href: "/estudos/historia", label: "História" },
  { href: "/estudos/tecnicas", label: "Técnicas" },
  { href: "/estudos/fundamentos", label: "Fundamentos" },
];

export function HeaderEstudos() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/estudos" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="section flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <MarcaTorakan className="h-8 w-8" />
            <span className="font-marca text-2xl leading-none text-accent">
              Torakan
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded px-2.5 py-1.5 text-sm font-medium transition-colors duration-150",
                    active
                      ? "text-fg"
                      : "text-muted hover:bg-elevated hover:text-fg",
                  )}
                >
                  {link.label}
                  {active ? (
                    <span className="absolute inset-x-2 -bottom-[13px] h-0.5 bg-accent" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/login" size="sm" className="hidden md:inline-flex">
            Área do Aluno / Professor
          </ButtonLink>

          <MenuMobile className="md:hidden" rotulo="Abrir navegação dos estudos">
            {LINKS.map((link) => (
              <MenuMobileLink
                key={link.href}
                href={link.href}
                ativo={isActive(link.href)}
              >
                {link.label}
              </MenuMobileLink>
            ))}
            <MenuMobileSeparador />
            <MenuMobileLink href="/login">
              Área do Aluno / Professor
            </MenuMobileLink>
            <MenuMobileLink href="/">Página inicial</MenuMobileLink>
          </MenuMobile>
        </div>
      </div>
    </header>
  );
}
