import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import {
  atualizarAluno,
  buscarConta,
  desativarConta,
  moverAlunoDeTurma,
} from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/academia/alunos/:id — troca de turma, faixa e nascimento. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const alunoId = Number(id);

  if (!Number.isInteger(alunoId)) {
    return NextResponse.json({ erro: "Id inválido." }, { status: 400 });
  }

  let corpo: {
    turmaId?: number;
    faixa?: string;
    dataNascimento?: string | null;
  };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const temTurma = Number.isInteger(corpo.turmaId);
  const temFaixa = typeof corpo.faixa === "string" && corpo.faixa.trim() !== "";
  const temNascimento = corpo.dataNascimento !== undefined;

  if (!temTurma && !temFaixa && !temNascimento) {
    return NextResponse.json(
      { erro: "Informe ao menos um campo para alterar." },
      { status: 400 },
    );
  }

  if (
    temNascimento &&
    corpo.dataNascimento !== null &&
    !/^\d{4}-\d{2}-\d{2}$/.test(corpo.dataNascimento ?? "")
  ) {
    return NextResponse.json(
      { erro: "Data de nascimento inválida." },
      { status: 400 },
    );
  }

  try {
    await exigirPerfil(["professor", "admin"]);

    if (temTurma) {
      await moverAlunoDeTurma(alunoId, corpo.turmaId as number);
    }
    if (temFaixa || temNascimento) {
      await atualizarAluno(alunoId, {
        ...(temFaixa ? { faixa: corpo.faixa } : {}),
        ...(temNascimento ? { dataNascimento: corpo.dataNascimento } : {}),
      });
    }

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

/**
 * DELETE /api/academia/alunos/:id — desmatricula o aluno.
 *
 * A conta é desativada, não apagada: o histórico de pagamentos continua de pé.
 * Professor só desmatricula quem é aluno puro; mexer em conta de professor ou
 * admin é privilégio do admin, pela rota de professores.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const alunoId = Number(id);

  if (!Number.isInteger(alunoId)) {
    return NextResponse.json({ erro: "Id inválido." }, { status: 400 });
  }

  try {
    const sessao = await exigirPerfil(["professor", "admin"]);

    if (sessao.id === alunoId) {
      return NextResponse.json(
        { erro: "Você não pode desmatricular a própria conta." },
        { status: 409 },
      );
    }

    const alvo = await buscarConta(alunoId);
    if (!alvo || !alvo.ativo) {
      return NextResponse.json(
        { erro: "Aluno não encontrado." },
        { status: 404 },
      );
    }

    if (alvo.role !== "aluno" && sessao.perfil !== "admin") {
      return NextResponse.json(
        { erro: "Só o admin pode desativar contas de professor ou admin." },
        { status: 403 },
      );
    }

    const removido = await desativarConta(alunoId);
    return NextResponse.json({ ok: true, nome: removido?.nome });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[academia/alunos/delete]", erro);
    return NextResponse.json(
      { erro: "Falha ao desmatricular o aluno." },
      { status: 500 },
    );
  }
}
