import { NextResponse } from "next/server";
import { limparCookieSessao } from "@/server/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/auth/logout — encerra a sessão apagando o cookie. */
export async function POST() {
  await limparCookieSessao();
  return NextResponse.json({ ok: true });
}
