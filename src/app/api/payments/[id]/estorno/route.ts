import { NextResponse } from "next/server";
import {
  buscarCobranca,
  definirStatusFinanceiro,
  estornarBaixa,
} from "@/server/pagamentos";
import { SemPermissao, exigirPerfil } from "@/server/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/:id/estorno
 *
 * Corpo: { motivo? }
 *
 * Desfaz uma baixa lançada por engano. Só vale para baixa manual — pagamento
 * aprovado por Mercado Pago ou Stripe não se estorna por aqui: o dinheiro
 * entrou de verdade e a devolução tem que ser feita no provedor.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cobrancaId = Number(id);

  if (!Number.isInteger(cobrancaId)) {
    return NextResponse.json({ erro: "Id inválido." }, { status: 400 });
  }

  let corpo: { motivo?: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  try {
    const lancador = await exigirPerfil(["professor", "admin"]);

    const cobranca = await buscarCobranca(cobrancaId);
    if (!cobranca) {
      return NextResponse.json(
        { erro: "Mensalidade não encontrada." },
        { status: 404 },
      );
    }

    if (cobranca.status !== "approved" && cobranca.status !== "paga") {
      return NextResponse.json(
        { erro: "Esta mensalidade não está quitada." },
        { status: 409 },
      );
    }

    const atualizada = await estornarBaixa(cobrancaId, {
      autorId: lancador.id,
      autorNome: lancador.nome,
      motivo: corpo.motivo?.trim() || null,
    });

    if (!atualizada) {
      return NextResponse.json(
        {
          erro:
            "Só é possível estornar baixa manual. Pagamentos aprovados pelo " +
            "Mercado Pago ou Stripe devem ser devolvidos no próprio provedor.",
        },
        { status: 409 },
      );
    }

    await definirStatusFinanceiro(atualizada.aluno_id, "pendente");

    return NextResponse.json({
      ok: true,
      cobranca_id: atualizada.id,
      status: atualizada.status,
      estornado_por: lancador.nome,
    });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[payments/estorno]", erro);
    return NextResponse.json(
      { erro: "Falha ao estornar." },
      { status: 500 },
    );
  }
}
