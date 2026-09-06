import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import { lerChamada, salvarChamada } from "@/server/chamada";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

/** GET /api/academia/chamada?turmaId=3&data=2026-09-08 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const turmaId = Number(url.searchParams.get("turmaId"));
  const data = url.searchParams.get("data") ?? "";

  if (!Number.isInteger(turmaId) || !DATA_VALIDA.test(data)) {
    return NextResponse.json(
      { erro: "Informe turmaId e data (AAAA-MM-DD)." },
      { status: 400 },
    );
  }

  try {
    await exigirPerfil(["professor", "admin"]);
    return NextResponse.json({ presencas: await lerChamada(turmaId, data) });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[academia/chamada/get]", erro);
    return NextResponse.json(
      { erro: "Falha ao ler a chamada." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/academia/chamada
 * Corpo: { turmaId, data, presencas: { alunoId, presente }[] }
 */
export async function POST(request: Request) {
  let corpo: {
    turmaId?: number;
    data?: string;
    presencas?: { alunoId?: number; presente?: boolean }[];
  };

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (!Number.isInteger(corpo.turmaId) || !DATA_VALIDA.test(corpo.data ?? "")) {
    return NextResponse.json(
      { erro: "Informe a turma e a data (AAAA-MM-DD)." },
      { status: 400 },
    );
  }
  if (!Array.isArray(corpo.presencas) || corpo.presencas.length === 0) {
    return NextResponse.json(
      { erro: "Nenhum aluno na chamada." },
      { status: 400 },
    );
  }

  const presencas = corpo.presencas
    .filter((linha) => Number.isInteger(linha.alunoId))
    .map((linha) => ({
      alunoId: linha.alunoId as number,
      presente: linha.presente === true,
    }));

  try {
    const sessao = await exigirPerfil(["professor", "admin"]);
    const resultado = await salvarChamada(
      corpo.turmaId as number,
      corpo.data as string,
      presencas,
      sessao.id,
    );
    return NextResponse.json({ ok: true, ...resultado });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[academia/chamada/post]", erro);
    return NextResponse.json(
      { erro: "Falha ao salvar a chamada." },
      { status: 500 },
    );
  }
}
