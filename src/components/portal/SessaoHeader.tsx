"use client";

import { useRouter } from "next/navigation";
import {
  MenuMobile,
  MenuMobileLink,
  MenuMobileSeparador,
} from "@/components/layout/MenuMobile";
import { Button } from "@/components/ui/Button";
import { useAcademia } from "@/lib/academiaStore";
import { DESTINO_POR_PERFIL } from "@/services/dataService";

const ROTULO = {
  aluno: "Aluno",
  professor: "Professor",
  admin: "Admin",
} as const;

/** Identifica quem está logado e encerra a sessão. */
export function SessaoHeader() {
  const router = useRouter();
  const { carregado, sessao, sair } = useAcademia();

  if (!carregado) return <span className="h-9 w-24" />;

  if (!sessao) {
    return (
      <>
        <Button
          size="sm"
          variant="secondary"
          className="hidden sm:inline-flex"
          onClick={() => router.push("/login")}
        >
          Entrar
        </Button>
        <MenuMobile className="sm:hidden" rotulo="Abrir menu do portal">
          <MenuMobileLink href="/login">Entrar</MenuMobileLink>
          <MenuMobileLink href="/estudos">Portal de estudos</MenuMobileLink>
          <MenuMobileLink href="/">Página inicial</MenuMobileLink>
        </MenuMobile>
      </>
    );
  }

  function encerrar() {
    sair();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop: identificação e sair */}
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-right">
          <span className="block text-2xs font-medium text-fg">
            {sessao.nome}
          </span>
          <span className="block font-mono text-[10px] text-subtle">
            {sessao.usuario} · {ROTULO[sessao.perfil]}
          </span>
        </span>
        <Button size="sm" variant="secondary" onClick={encerrar}>
          Sair
        </Button>
      </div>

      {/* Mobile: tudo dentro do menu */}
      <MenuMobile className="sm:hidden" rotulo="Abrir menu do portal">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-fg">{sessao.nome}</p>
          <p className="font-mono text-[10px] text-subtle">
            {sessao.usuario} · {ROTULO[sessao.perfil]}
          </p>
        </div>
        <MenuMobileSeparador />
        <MenuMobileLink href={DESTINO_POR_PERFIL[sessao.perfil]}>
          Meu portal
        </MenuMobileLink>
        <MenuMobileLink href="/estudos">Portal de estudos</MenuMobileLink>
        <MenuMobileLink href="/">Página inicial</MenuMobileLink>
        <MenuMobileSeparador />
        <button
          type="button"
          onClick={encerrar}
          className="flex w-full items-center rounded px-3 py-2 text-left text-sm font-medium text-accent transition-colors hover:bg-elevated"
        >
          Sair
        </button>
      </MenuMobile>
    </>
  );
}
