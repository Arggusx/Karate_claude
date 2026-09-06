import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import {
  aplicarStatusDoProvedor,
  buscarCobranca,
  buscarCobrancaPorReferenciaExterna,
  definirStatusFinanceiro,
  descartarEventoWebhook,
  registrarEventoWebhook,
  type StatusCobranca,
} from "@/server/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Tradução do status do Mercado Pago para o vocabulário interno. */
const MAPA_STATUS: Record<string, StatusCobranca> = {
  approved: "approved",
  authorized: "approved",
  pending: "pending",
  in_process: "pending",
  in_mediation: "pending",
  rejected: "rejected",
  cancelled: "cancelled",
  refunded: "cancelled",
  charged_back: "cancelled",
};

/**
 * Valida a assinatura `x-signature` do Mercado Pago.
 * Sem `MERCADOPAGO_WEBHOOK_SECRET` a checagem é pulada (útil no ngrok local),
 * mas em produção o segredo deve estar sempre definido.
 */
function assinaturaValida(request: Request, dataId: string): boolean {
  const segredo = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!segredo) return true;

  const assinatura = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!assinatura) return false;

  const partes = Object.fromEntries(
    assinatura.split(",").map((parte) => {
      const [chave, valor] = parte.split("=");
      return [chave?.trim(), valor?.trim()];
    }),
  );

  const ts = partes.ts;
  const hash = partes.v1;
  if (!ts || !hash) return false;

  const manifesto = `id:${dataId};request-id:${requestId ?? ""};ts:${ts};`;
  const esperado = createHmac("sha256", segredo)
    .update(manifesto)
    .digest("hex");

  const a = Buffer.from(esperado, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * POST /api/webhooks/mercadopago
 *
 * O Mercado Pago manda só o id da transação; a fonte de verdade é a consulta
 * de volta na API dele. Sempre respondemos 200 — erro aqui faz o provedor
 * reenviar indefinidamente.
 */
export async function POST(request: Request) {
  let evento: {
    type?: string;
    action?: string;
    data?: { id?: string | number };
  };

  try {
    evento = await request.json();
  } catch {
    return NextResponse.json({ recebido: true }, { status: 200 });
  }

  const dataId = evento.data?.id ? String(evento.data.id) : null;
  const tipo = evento.type ?? evento.action ?? null;

  if (!dataId) return NextResponse.json({ recebido: true }, { status: 200 });

  // Só nos interessam notificações de pagamento.
  if (tipo && !tipo.includes("payment")) {
    return NextResponse.json({ ignorado: tipo }, { status: 200 });
  }

  if (!assinaturaValida(request, dataId)) {
    console.warn("[webhook/mercadopago] assinatura inválida", dataId);
    return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
  }

  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado.");

    // 1. Consulta o status real na API do provedor.
    const cliente = new MercadoPagoConfig({ accessToken: token });
    const pagamento = await new Payment(cliente).get({ id: dataId });

    const statusProvedor = pagamento.status ?? "pending";
    const status = MAPA_STATUS[statusProvedor] ?? "pending";

    // 2. Idempotência: o par (pagamento, status) só é processado uma vez.
    const inedito = await registrarEventoWebhook(
      "mercadopago",
      `${dataId}:${statusProvedor}`,
      tipo,
      evento,
    );
    if (!inedito) {
      return NextResponse.json({ duplicado: true }, { status: 200 });
    }

    // 3. Localiza a cobrança: external_reference é o id no nosso banco.
    const referencia = pagamento.external_reference;
    const cobranca = referencia
      ? await buscarCobranca(Number(referencia))
      : await buscarCobrancaPorReferenciaExterna(dataId);

    if (!cobranca) {
      console.warn("[webhook/mercadopago] cobrança não encontrada", dataId);
      return NextResponse.json({ recebido: true }, { status: 200 });
    }

    // 4. Aplica o status e reflete na situação financeira do aluno.
    await aplicarStatusDoProvedor(cobranca.id, status, statusProvedor);

    if (status === "approved") {
      await definirStatusFinanceiro(cobranca.aluno_id, "ativo");
    }

    return NextResponse.json({ ok: true, status }, { status: 200 });
  } catch (erro) {
    console.error("[webhook/mercadopago]", erro);
    // Libera o evento para a retentativa do Mercado Pago.
    await descartarEventoWebhook("mercadopago", dataId).catch(() => {});
    return NextResponse.json(
      { erro: "Falha ao processar; reenvie." },
      { status: 500 },
    );
  }
}

/** O Mercado Pago faz um GET de verificação ao cadastrar a URL. */
export async function GET() {
  return NextResponse.json({ ok: true });
}
