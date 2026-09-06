import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import {
  definirItemPrograma,
  listarProgramaConcluido,
} from "@/server/progresso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/academia/alunos/:id/programa — itens já validados na faixa atual. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const alunoId = Number(id);

  if (!Number.isInteger(alunoId)) {
    return NextResponse.json({ erro: "Id inválido." }, { status: 400 });
  }

  try {
    const sessao = await exigirPerfil(["aluno", "professor", "admin"]);

    // O aluno vê o próprio programa; a equipe vê o de todos.
    const equipe = sessao.perfil !== "aluno";
    if (!equipe && sessao.id !== alunoId) {
      return NextResponse.json(
        { erro: "Você só pode ver o próprio programa." },
        { status: 403 },
      );
    }

    return NextResponse.json({ itens: await listarProgramaConcluido(alunoId) });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[alunos/programa/get]", erro);
    return NextResponse.json(
      { erro: "Falha ao ler o programa." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/academia/alunos/:id/programa
 * Corpo: { tipo: "kata" | "kihon", item: string, concluido: boolean }
 *
 * Validar item do programa é avaliação técnica: só professor e admin.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const alunoId = Number(id);

  if (!Number.isInteger(alunoId)) {
    return NextResponse.json({ erro: "Id inválido." }, { status: 400 });
  }

  let corpo: { tipo?: string; item?: string; concluido?: boolean };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (corpo.tipo !== "kata" && corpo.tipo !== "kihon") {
    return NextResponse.json(
      { erro: 'O tipo deve ser "kata" ou "kihon".' },
      { status: 400 },
    );
  }
  if (!corpo.item?.trim()) {
    return NextResponse.json({ erro: "Informe o item." }, { status: 400 });
  }

  try {
    const sessao = await exigirPerfil(["professor", "admin"]);
    await definirItemPrograma(alunoId, {
      tipo: corpo.tipo,
      item: corpo.item.trim(),
      concluido: corpo.concluido === true,
      autorId: sessao.id,
    });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[alunos/programa/post]", erro);
    return NextResponse.json(
      { erro: "Falha ao atualizar o programa." },
      { status: 500 },
    );
  }
}
