"use client";

import Link from "next/link";
import { useAcademia } from "@/lib/academiaStore";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PerfilUsuario } from "@/types";

const ROTULO: Record<PerfilUsuario, string> = {
  aluno: "aluno",
  professor: "professor",
  admin: "admin",
};

/**
 * Libera a página apenas para os perfis indicados. Enquanto o estado não é
 * lido do navegador, mostra um esqueleto — evita piscar a tela de acesso
 * negado para quem já está logado.
 */
export function GuardaPortal({
  perfis,
  children,
}: {
  perfis: PerfilUsuario[];
  children: React.ReactNode;
}) {
  const { carregado, sessao } = useAcademia();

  if (!carregado) {
    return (
      <div className="section space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!sessao) {
    return (
      <Aviso
        titulo="Você não está logado"
        texto="Entre com seu nome de usuário e senha para acessar esta área."
      />
    );
  }

  if (!perfis.includes(sessao.perfil)) {
    return (
      <Aviso
        titulo="Acesso restrito"
        texto={`Esta área é exclusiva de ${perfis
          .map((perfil) => ROTULO[perfil])
          .join(" e ")}. Você entrou como ${ROTULO[sessao.perfil]}.`}
      />
    );
  }

  return <>{children}</>;
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="section">
      <div className="card mx-auto max-w-md p-5 text-center">
        <h1 className="heading-md">{titulo}</h1>
        <p className="body-muted mt-2">{texto}</p>
        <Link
          href="/login"
          className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Ir para o login
        </Link>
      </div>
    </div>
  );
}
