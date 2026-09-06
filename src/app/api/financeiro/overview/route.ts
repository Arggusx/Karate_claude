import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import { VALOR_MENSALIDADE_CENTAVOS, listarSituacaoFinanceira } from "@/server/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/financeiro/overview
 *
 * Panorama para professor e admin: quantas mensalidades cada aluno tem em
 * aberto e desde quando. Num sistema de pagamento voluntário, esta é a tela
 * que substitui a cobrança automática.
 */
export async function GET() {
  try {
    await exigirPerfil(["professor", "admin"]);

    const alunos = await listarSituacaoFinanceira();

    return NextResponse.json({
      valor_mensalidade_centavos: VALOR_MENSALIDADE_CENTAVOS,
      total_alunos: alunos.length,
      alunos_com_pendencia: alunos.filter((a) => a.em_aberto > 0).length,
      total_aberto_centavos: alunos.reduce(
        (soma, a) => soma + a.total_aberto_centavos,
        0,
      ),
      alunos,
    });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[financeiro/overview]", erro);
    return NextResponse.json(
      { erro: "Falha ao carregar o panorama financeiro." },
      { status: 500 },
    );
  }
}
