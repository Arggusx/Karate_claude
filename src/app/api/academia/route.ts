import { NextResponse } from "next/server";
import { listarAlunos, listarProfessores, listarTurmas } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/academia — turmas, alunos e professores do banco.
 * Fonte única dos portais; substitui o estado que ficava no localStorage.
 */
export async function GET() {
  try {
    const [turmas, alunos, professores] = await Promise.all([
      listarTurmas(),
      listarAlunos(),
      listarProfessores(),
    ]);

    return NextResponse.json({ turmas, alunos, professores });
  } catch (erro) {
    console.error("[academia]", erro);
    return NextResponse.json(
      { erro: "Falha ao carregar os dados da academia." },
      { status: 500 },
    );
  }
}
