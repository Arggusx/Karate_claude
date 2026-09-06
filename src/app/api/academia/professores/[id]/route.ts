import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import { buscarConta, desativarConta } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/academia/professores/:id — desativa a conta de um professor.
 *
 * Exclusivo do admin, como o cadastro. A conta é desativada, não apagada, e as
 * turmas que apontavam para ela ficam sem professor até serem reatribuídas.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const professorId = Number(id);

  if (!Number.isInteger(professorId)) {
    return NextResponse.json({ erro: "Id inválido." }, { status: 400 });
  }

  try {
    const sessao = await exigirPerfil(["admin"]);

    // Um admin que se desativa perde o acesso e não há quem o reative.
    if (sessao.id === professorId) {
      return NextResponse.json(
        { erro: "Você não pode desativar a própria conta." },
        { status: 409 },
      );
    }

    const alvo = await buscarConta(professorId);
    if (!alvo || !alvo.ativo) {
      return NextResponse.json(
        { erro: "Professor não encontrado." },
        { status: 404 },
      );
    }

    if (alvo.role === "aluno") {
      return NextResponse.json(
        { erro: "Esta conta é de aluno. Use a desmatrícula de alunos." },
        { status: 409 },
      );
    }

    const removido = await desativarConta(professorId);
    return NextResponse.json({ ok: true, nome: removido?.nome });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[academia/professores/delete]", erro);
    return NextResponse.json(
      { erro: "Falha ao desativar o professor." },
      { status: 500 },
    );
  }
}
