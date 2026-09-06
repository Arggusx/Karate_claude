import { NextResponse } from "next/server";
import { sessaoAtual } from "@/server/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/sessao — quem está logado, segundo o cookie assinado.
 * A interface usa isto para restaurar a sessão ao abrir o portal.
 */
export async function GET() {
  const sessao = await sessaoAtual();
  if (!sessao) return NextResponse.json({ sessao: null });

  return NextResponse.json({
    sessao: {
      id: String(sessao.id),
      nome: sessao.nome,
      usuario: sessao.usuario,
      perfil: sessao.perfil,
    },
  });
}
