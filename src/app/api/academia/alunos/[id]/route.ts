import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import { moverAlunoDeTurma } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/academia/alunos/:id — hoje só troca a turma. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const alunoId = Number(id);

  if (!Number.isInteger(alunoId)) {
    return NextResponse.json({ erro: "Id inválido." }, { status: 400 });
  }

  let corpo: { turmaId?: number };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (!Number.isInteger(corpo.turmaId)) {
    return NextResponse.json({ erro: "Informe a turma." }, { status: 400 });
  }

  try {
    await exigirPerfil(["professor", "admin"]);
    await moverAlunoDeTurma(alunoId, corpo.turmaId as number);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[academia/alunos/patch]", erro);
    return NextResponse.json(
      { erro: "Falha ao mover o aluno." },
      { status: 500 },
    );
  }
}
