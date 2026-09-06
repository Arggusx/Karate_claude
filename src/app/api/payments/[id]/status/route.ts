import { NextResponse } from "next/server";
import { buscarCobranca, estaPaga } from "@/server/pagamentos";
import { sessaoAtual } from "@/server/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/payments/:id/status
 *
 * Consultada pelo polling da tela de checkout enquanto o aluno paga.
 * Lê apenas o banco — quem atualiza o status é o webhook.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cobrancaId = Number(id);

  if (!Number.isInteger(cobrancaId)) {
    return NextResponse.json({ erro: "Id inválido." }, { status: 400 });
  }

  try {
    const sessao = await sessaoAtual();
    if (!sessao) {
      return NextResponse.json({ erro: "Faça login." }, { status: 401 });
    }

    const cobranca = await buscarCobranca(cobrancaId);
    if (!cobranca) {
      return NextResponse.json(
        { erro: "Cobrança não encontrada." },
        { status: 404 },
      );
    }

    const equipe = sessao.perfil === "professor" || sessao.perfil === "admin";
    if (!equipe && cobranca.aluno_id !== sessao.id) {
      return NextResponse.json(
        { erro: "Esta cobrança não é sua." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      cobranca_id: cobranca.id,
      status: cobranca.status,
      pago: estaPaga(cobranca),
      pago_em: cobranca.pago_em,
      expira_em: cobranca.expira_em,
      valor_centavos: cobranca.valor_centavos,
    });
  } catch (erro) {
    console.error("[payments/status]", erro);
    return NextResponse.json(
      { erro: "Falha ao consultar o pagamento." },
      { status: 500 },
    );
  }
}
