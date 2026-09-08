"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

/**
 * Navegação entre katas com virada de página.
 *
 * A folha atual gira sobre a lombada — esquerda ou direita conforme o sentido —
 * e a próxima entra por trás. Usa a View Transitions API do navegador: ela
 * fotografa o estado antes e depois da navegação e anima entre os dois, o que
 * dispensa manter as duas páginas montadas ao mesmo tempo.
 *
 * Onde a API não existe, `startViewTransition` é undefined e a navegação
 * acontece normalmente, sem animação. Nada quebra — só não vira página.
 *
 * O sentido vai num atributo no <html> porque o CSS da transição roda fora da
 * árvore do React: os pseudo-elementos ::view-transition são do documento.
 */
export function NavegacaoKata({
  anterior,
  proximo,
}: {
  anterior: { id: string; nome: string } | null;
  proximo: { id: string; nome: string } | null;
}) {
  const router = useRouter();

  function virar(
    evento: MouseEvent<HTMLAnchorElement>,
    href: string,
    sentido: "frente" | "tras",
  ) {
    // Deixa passar cliques que o usuário quer em nova aba.
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey) return;

    const iniciar = document.startViewTransition?.bind(document);
    const menosMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!iniciar || menosMovimento) return;

    evento.preventDefault();
    document.documentElement.dataset.virada = sentido;

    const transicao = iniciar(() => {
      router.push(href);
    });

    transicao.finished.finally(() => {
      delete document.documentElement.dataset.virada;
    });
  }

  return (
    <nav className="grid gap-3 sm:grid-cols-2">
      {anterior ? (
        <Link
          href={`/estudos/tecnicas/kata/${anterior.id}`}
          onClick={(e) =>
            virar(e, `/estudos/tecnicas/kata/${anterior.id}`, "tras")
          }
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
          onClick={(e) =>
            virar(e, `/estudos/tecnicas/kata/${proximo.id}`, "frente")
          }
          className="card card-hover px-4 py-3 text-right"
        >
          <p className="text-2xs text-muted">Próximo kata →</p>
          <p className="mt-0.5 text-sm font-semibold text-fg">{proximo.nome}</p>
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
  );
}
