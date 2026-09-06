import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sql, competenciaDoMes } from "@/lib/db";
import { sessaoAtual } from "@/server/sessao";
import {
  buscarAluno,
  buscarCobrancaDoMes,
  estaPaga,
  garantirCobrancaDoMes,
  registrarCheckoutStripe,
} from "@/server/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/stripe/checkout
 *
 * Corpo: { student_id?, usuario?, competencia? }
 *
 * Cria uma Checkout Session avulsa (mode: "payment") para a mensalidade do
 * mês. Não existe assinatura recorrente: o pagamento é voluntário e cada mês
 * é cobrado individualmente, quando e se o aluno quiser pagar pelo portal.
 */
export async function POST(request: Request) {
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) {
    return NextResponse.json(
      { erro: "STRIPE_SECRET_KEY não configurada." },
      { status: 500 },
    );
  }

  let corpo: {
    student_id?: number;
    usuario?: string;
    competencia?: string;
  };

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const competencia = corpo.competencia ?? competenciaDoMes();
  const origem =
    process.env.APP_URL ?? new URL(request.url).origin;

  try {
    const sessaoUsuario = await sessaoAtual();
    if (!sessaoUsuario) {
      return NextResponse.json({ erro: "Faça login." }, { status: 401 });
    }

    const aluno = await buscarAluno({
      id: corpo.student_id,
      usuario: corpo.usuario,
    });

    if (!aluno) {
      return NextResponse.json(
        { erro: "Aluno não encontrado." },
        { status: 404 },
      );
    }
    if (!aluno.ativo) {
      return NextResponse.json({ erro: "Matrícula inativa." }, { status: 409 });
    }

    const equipe =
      sessaoUsuario.perfil === "professor" || sessaoUsuario.perfil === "admin";
    if (!equipe && aluno.id !== sessaoUsuario.id) {
      return NextResponse.json(
        { erro: "Você só pode pagar a própria mensalidade." },
        { status: 403 },
      );
    }

    const existente = await buscarCobrancaDoMes(aluno.id, competencia);
    if (existente && estaPaga(existente)) {
      return NextResponse.json(
        { erro: "A mensalidade deste mês já está paga." },
        { status: 409 },
      );
    }

    const cobranca = await garantirCobrancaDoMes(aluno.id, competencia);
    const stripe = new Stripe(chave);

    // Reaproveita o customer da Stripe para o aluno não virar vários cadastros.
    let customerId = aluno.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: aluno.nome,
        email: aluno.email,
        metadata: { aluno_id: String(aluno.id) },
      });
      customerId = customer.id;
      await sql`
        UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${aluno.id}`;
    }

    const sessao = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: String(cobranca.id),
      metadata: {
        cobranca_id: String(cobranca.id),
        aluno_id: String(aluno.id),
        competencia,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            unit_amount: cobranca.valor_centavos,
            product_data: {
              name: `Mensalidade ${competencia.slice(0, 7)} — Portal Shotokan`,
            },
          },
        },
      ],
      success_url: `${origem}/portal/aluno?pagamento=sucesso`,
      cancel_url: `${origem}/portal/aluno?pagamento=cancelado`,
    });

    await registrarCheckoutStripe(cobranca.id, sessao.id);

    return NextResponse.json(
      { cobranca_id: cobranca.id, checkout_url: sessao.url, sessao: sessao.id },
      { status: 201 },
    );
  } catch (erro) {
    // A Stripe recusa cobranças abaixo de R$ 0,50 — o PIX não tem esse piso.
    if (
      erro instanceof Stripe.errors.StripeInvalidRequestError &&
      erro.code === "amount_too_small"
    ) {
      return NextResponse.json(
        {
          erro:
            "A Stripe exige no mínimo R$ 0,50 por cobrança no cartão. " +
            "Para este valor, use o PIX.",
          codigo: "amount_too_small",
        },
        { status: 400 },
      );
    }

    console.error("[stripe/checkout]", erro);
    return NextResponse.json(
      { erro: "Não foi possível abrir o checkout." },
      { status: 500 },
    );
  }
}
