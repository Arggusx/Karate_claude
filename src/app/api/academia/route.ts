import { NextResponse } from "next/server";
import { listarAlunos, listarProfessores, listarTurmas } from "@/server/usuarios";
import { VALOR_MENSALIDADE_CENTAVOS } from "@/server/pagamentos";
import { calcularProgresso } from "@/server/progresso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/academia — turmas, alunos e professores do banco.
 * Fonte única dos portais; substitui o estado que ficava no localStorage.
 */
export async function GET() {
  try {
    const [turmas, alunosBase, professores, progresso] = await Promise.all([
      listarTurmas(),
      listarAlunos(),
      listarProfessores(),
      calcularProgresso(),
    ]);

    // Progresso e frequência são calculados a partir das presenças e do
    // programa validado — as colunas de mesmo nome em alunos_perfil viraram
    // resquício e não são mais a fonte da verdade.
    const alunos = alunosBase.map((aluno) => {
      const dados = progresso.get(aluno.id);
      return {
        ...aluno,
        progresso: dados?.total ?? 0,
        frequencia: dados?.frequencia ?? 0,
        apto_exame: dados?.aptoParaExame ?? false,
        criterios: dados?.criterios ?? null,
      };
    });

    // O valor da mensalidade vem daqui — e não de env no navegador — porque
    // só variáveis com prefixo NEXT_PUBLIC_ chegam ao bundle do cliente.
    return NextResponse.json({
      turmas,
      alunos,
      professores,
      mensalidade_centavos: VALOR_MENSALIDADE_CENTAVOS,
    });
  } catch (erro) {
    console.error("[academia]", erro);
    return NextResponse.json(
      { erro: "Falha ao carregar os dados da academia." },
      { status: 500 },
    );
  }
}
