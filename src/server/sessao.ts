import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { Perfil } from "@/server/usuarios";

/**
 * Sessão assinada em cookie httpOnly.
 *
 * O conteúdo é legível (base64url), mas vem acompanhado de um HMAC-SHA256
 * calculado com SESSION_SECRET: qualquer alteração no payload invalida a
 * assinatura. O cookie é httpOnly, então JavaScript da página não o lê, e
 * `sameSite=lax` corta CSRF vindo de outro site.
 *
 * É isto que as rotas sensíveis usam para saber quem está chamando — o
 * cliente não decide mais o próprio papel.
 */

const NOME_COOKIE = "shotokan_sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 12; // 12 horas

export interface SessaoServidor {
  id: number;
  nome: string;
  usuario: string;
  perfil: Perfil;
  /** Epoch em segundos. */
  exp: number;
}

function segredo(): string {
  const valor = process.env.SESSION_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres).",
    );
  }
  return valor;
}

function assinar(payload: string): string {
  return createHmac("sha256", segredo()).update(payload).digest("base64url");
}

export function criarToken(
  dados: Omit<SessaoServidor, "exp">,
  duracao = DURACAO_SEGUNDOS,
): string {
  const sessao: SessaoServidor = {
    ...dados,
    exp: Math.floor(Date.now() / 1000) + duracao,
  };
  const payload = Buffer.from(JSON.stringify(sessao)).toString("base64url");
  return `${payload}.${assinar(payload)}`;
}

export function lerToken(token: string | undefined): SessaoServidor | null {
  if (!token) return null;

  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return null;

  // Comparação em tempo constante evita vazar informação por timing.
  const esperada = Buffer.from(assinar(payload));
  const recebida = Buffer.from(assinatura);
  if (
    esperada.length !== recebida.length ||
    !timingSafeEqual(esperada, recebida)
  ) {
    return null;
  }

  try {
    const sessao = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessaoServidor;

    if (!sessao.exp || sessao.exp * 1000 < Date.now()) return null;
    return sessao;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------- cookie

export async function gravarCookieSessao(
  dados: Omit<SessaoServidor, "exp">,
): Promise<void> {
  const jarra = await cookies();
  jarra.set(NOME_COOKIE, criarToken(dados), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function limparCookieSessao(): Promise<void> {
  const jarra = await cookies();
  jarra.delete(NOME_COOKIE);
}

export async function sessaoAtual(): Promise<SessaoServidor | null> {
  const jarra = await cookies();
  return lerToken(jarra.get(NOME_COOKIE)?.value);
}

// ---------------------------------------------------------- guardas

export class SemPermissao extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
  }
}

/** Exige uma sessão válida com um dos perfis informados. */
export async function exigirPerfil(
  perfis: Perfil[],
): Promise<SessaoServidor> {
  const sessao = await sessaoAtual();

  if (!sessao) {
    throw new SemPermissao("Faça login para continuar.", 401);
  }
  if (!perfis.includes(sessao.perfil)) {
    throw new SemPermissao(
      "Sua conta não tem permissão para esta ação.",
      403,
    );
  }
  return sessao;
}

/** Converte a exceção em resposta JSON; devolve null se não for de permissão. */
export function respostaDeErro(erro: unknown) {
  if (erro instanceof SemPermissao) {
    return { erro: erro.message, status: erro.status };
  }
  return null;
}
