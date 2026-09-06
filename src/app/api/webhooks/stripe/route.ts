import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sql } from "@/lib/db";
import {
  aplicarStatusDoProvedor,
  buscarCobranca,
  definirStatusFinanceiro,
  descartarEventoWebhook,
  registrarEventoWebhook,
} from "@/server/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 *
 * Eventos tratados:
 *  - checkout.session.completed → cartão avulso aprovado
 *  - checkout.session.expired   → sessão abandonada, cobrança volta a aberta
 *
 * Não há assinatura recorrente: o pagamento é voluntário e mês a mês.
 *
 * A assinatura do corpo é verificada com STRIPE_WEBHOOK_SECRET, por isso o
 * corpo precisa ser lido como texto cru (sem parse antes).
 */
export async function POST(request: Request) {
  const chave = process.env.STRIPE_SECRET_KEY;
  const segredo = process.env.STRIPE_WEBHOOK_SECRET;

  if (!chave || !segredo) {
    return NextResponse.json(
      { erro: "Stripe não configurada." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(chave);
  const assinatura = request.headers.get("stripe-signature");
  const corpoCru = await request.text();

  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(corpoCru, assinatura ?? "", segredo);
  } catch (erro) {
    console.warn("[webhook/stripe] assinatura inválida", erro);
    return NextResponse.json({ erro: "assinatura inválida" }, { status: 400 });
  }

  // A Stripe reenvia eventos: o id do evento garante processamento único.
  const inedito = await registrarEventoWebhook(
    "stripe",
    evento.id,
    evento.type,
    { type: evento.type },
  );
  if (!inedito) return NextResponse.json({ duplicado: true }, { status: 200 });

  try {
    switch (evento.type) {
      case "checkout.session.completed": {
        const sessao = evento.data.object as Stripe.Checkout.Session;
        const cobrancaId =
          sessao.metadata?.cobranca_id ?? sessao.client_reference_id;

        if (sessao.payment_status !== "paid") break;
        if (!cobrancaId) break;

        const cobranca = await buscarCobranca(Number(cobrancaId));
        if (!cobranca) break;

        await aplicarStatusDoProvedor(cobranca.id, "approved", "paid");
        await definirStatusFinanceiro(cobranca.aluno_id, "ativo");
        break;
      }

      case "checkout.session.expired": {
        const sessao = evento.data.object as Stripe.Checkout.Session;
        const cobrancaId =
          sessao.metadata?.cobranca_id ?? sessao.client_reference_id;
        if (!cobrancaId) break;

        const cobranca = await buscarCobranca(Number(cobrancaId));
        // A cobrança segue em aberto: só limpamos a referência da sessão.
        if (cobranca && !["approved", "paga"].includes(cobranca.status)) {
          await sql`
            UPDATE mensalidades
               SET external_payment_id = NULL,
                   payment_method      = NULL,
                   provedor            = NULL,
                   atualizado_em       = CURRENT_TIMESTAMP
             WHERE id = ${cobranca.id}`;
        }
        break;
      }

      default:
        // Demais eventos ficam registrados em webhook_events e são ignorados.
        break;
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (erro) {
    console.error("[webhook/stripe]", erro);
    // Libera o evento para a retentativa da Stripe.
    await descartarEventoWebhook("stripe", evento.id);
    return NextResponse.json(
      { erro: "Falha ao processar; reenvie." },
      { status: 500 },
    );
  }
}
