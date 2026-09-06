import { NextResponse } from "next/server";
import { SemPermissao, sessaoAtual } from "@/server/sessao";
import {
  buscarAluno,
  listarCobrancasDoAluno,
  listarLancamentos,
} from "@/server/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/students/:usuario/payments
 *
 * Histórico de mensalidades do aluno — usado no portal do aluno e no painel
 * financeiro do professor. `?lancamentos=1` traz também a trilha de baixas.
 *
 * O aluno só enxerga a própria matrícula; professor e admin enxergam todas.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ usuario: string }> },
) {
  const { usuario } = await params;
  const comLancamentos =
    new URL(request.url).searchParams.get("lancamentos") === "1";

  try {
    const sessao = await sessaoAtual();
    if (!sessao) {
      return NextResponse.json({ erro: "Faça login." }, { status: 401 });
    }
    const equipe = sessao.perfil === "professor" || sessao.perfil === "admin";
    if (!equipe && sessao.usuario !== usuario) {
      return NextResponse.json(
        { erro: "Você só pode ver as próprias mensalidades." },
        { status: 403 },
      );
    }

    const aluno = await buscarAluno({ usuario });
    if (!aluno) {
      return NextResponse.json(
        { erro: "Aluno não encontrado." },
        { status: 404 },
      );
    }

    const cobrancas = await listarCobrancasDoAluno(aluno.id);

    const detalhadas = comLancamentos
      ? await Promise.all(
          cobrancas.map(async (cobranca) => ({
            ...cobranca,
            lancamentos: await listarLancamentos(cobranca.id),
          })),
        )
      : cobrancas;

    return NextResponse.json({
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        usuario: aluno.usuario,
        financial_status: aluno.financial_status,
      },
      cobrancas: detalhadas,
      em_aberto: cobrancas.filter(
        (item) => item.status === "pending" || item.status === "aberta",
      ).length,
    });
  } catch (erro) {
    console.error("[students/payments]", erro);
    return NextResponse.json(
      { erro: "Falha ao carregar as mensalidades." },
      { status: 500 },
    );
  }
}
