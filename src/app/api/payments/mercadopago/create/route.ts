import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { competenciaDoMes } from "@/lib/db";
import { sessaoAtual } from "@/server/sessao";
import {
  buscarAluno,
  buscarCobrancaDoMes,
  estaPaga,
  garantirCobrancaDoMes,
  registrarPixNaCobranca,
} from "@/server/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** TLDs reservados pela RFC 2606/6761 — o Mercado Pago recusa todos eles. */
const TLDS_NAO_ROTEAVEIS = [
  "local",
  "localhost",
  "internal",
  "test",
  "invalid",
  "example",
];

/**
 * E-mail que vai no campo payer do Mercado Pago.
 *
 * Quem se cadastra sem informar e-mail recebe o placeholder
 * "usuario@shotokan.local", e o provedor rejeita a cobrança com
 * "payer.email must be a valid email". Nesse caso trocamos por um endereço no
 * domínio da própria aplicação, que é só informativo para o PIX.
 */
function emailDoPagador(aluno: {
  id: number;
  usuario: string | null;
  email: string;
}): string {
  const dominio = aluno.email.split("@")[1] ?? "";
  const tld = dominio.split(".").pop() ?? "";

  if (dominio.includes(".") && !TLDS_NAO_ROTEAVEIS.includes(tld)) {
    return aluno.email;
  }

  let host = "";
  try {
    host = new URL(process.env.APP_URL ?? "").hostname;
  } catch {
    host = "";
  }

  const base =
    host.includes(".") && !TLDS_NAO_ROTEAVEIS.includes(host.split(".").pop()!)
      ? host
      : "example.com";

  return `${aluno.usuario ?? `aluno${aluno.id}`}@${base}`;
}

/**
 * POST /api/payments/mercadopago/create
 *
 * Corpo: { student_id?: number, usuario?: string, competencia?: "YYYY-MM-01" }
 * Gera (ou reaproveita) o PIX da mensalidade do mês e devolve o QR Code.
 */
export async function POST(request: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { erro: "MERCADOPAGO_ACCESS_TOKEN não configurado." },
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

  if (!corpo.student_id && !corpo.usuario) {
    return NextResponse.json(
      { erro: "Informe student_id ou usuario." },
      { status: 400 },
    );
  }

  const competencia = corpo.competencia ?? competenciaDoMes();

  try {
    const sessao = await sessaoAtual();
    if (!sessao) {
      return NextResponse.json({ erro: "Faça login." }, { status: 401 });
    }

    // 1. O aluno existe e está ativo?
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
      return NextResponse.json(
        { erro: "Matrícula inativa. Procure a secretaria do dojo." },
        { status: 409 },
      );
    }

    // Um aluno só gera cobrança para si; professor e admin geram para outros.
    const equipe = sessao.perfil === "professor" || sessao.perfil === "admin";
    if (!equipe && aluno.id !== sessao.id) {
      return NextResponse.json(
        { erro: "Você só pode pagar a própria mensalidade." },
        { status: 403 },
      );
    }

    // 2. Já existe fatura paga para o período?
    const existente = await buscarCobrancaDoMes(aluno.id, competencia);
    if (existente && estaPaga(existente)) {
      return NextResponse.json(
        {
          erro: "A mensalidade deste mês já está paga.",
          cobranca_id: existente.id,
          status: "approved",
          // O portal usa isto para dizer no toast como e quando foi paga.
          provedor: existente.provedor,
          payment_method: existente.payment_method,
          pago_em: existente.pago_em,
        },
        { status: 409 },
      );
    }

    // 3. Cobrança pendente no banco (idempotente por aluno + competência).
    const cobranca = await garantirCobrancaDoMes(aluno.id, competencia);

    // 4. PIX ainda válido? Reaproveita em vez de gerar outro.
    const aindaValido =
      cobranca.pix_qr_code &&
      cobranca.expira_em &&
      new Date(cobranca.expira_em).getTime() > Date.now();

    if (aindaValido) {
      return NextResponse.json({
        cobranca_id: cobranca.id,
        status: "pending",
        valor_centavos: cobranca.valor_centavos,
        vencimento: cobranca.vencimento,
        expira_em: cobranca.expira_em,
        pix_qr_code: cobranca.pix_qr_code,
        pix_qr_code_base64: cobranca.pix_qr_code_base64,
        reaproveitado: true,
      });
    }

    // 5. Cria o pagamento PIX no Mercado Pago.
    const cliente = new MercadoPagoConfig({ accessToken: token });
    const expiraEm = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    const [primeiroNome, ...resto] = aluno.nome.split(" ");

    const pagamento = await new Payment(cliente).create({
      body: {
        transaction_amount: Number(
          (cobranca.valor_centavos / 100).toFixed(2),
        ),
        description: `Mensalidade ${competencia.slice(0, 7)} — Torakan`,
        payment_method_id: "pix",
        // external_reference liga o pagamento do provedor à linha do banco.
        external_reference: String(cobranca.id),
        date_of_expiration: expiraEm.toISOString(),
        notification_url: process.env.MERCADOPAGO_WEBHOOK_URL,
        payer: {
          email: emailDoPagador(aluno),
          first_name: primeiroNome,
          last_name: resto.join(" ") || primeiroNome,
        },
      },
      requestOptions: {
        // Evita cobrança duplicada se o cliente reenviar a requisição.
        idempotencyKey: `cobranca-${cobranca.id}-${competencia}`,
      },
    });

    const dadosPix = pagamento.point_of_interaction?.transaction_data;

    if (!pagamento.id || !dadosPix?.qr_code) {
      return NextResponse.json(
        { erro: "O Mercado Pago não retornou o QR Code do PIX." },
        { status: 502 },
      );
    }

    // 6. Persiste QR Code e referência externa.
    const atualizada = await registrarPixNaCobranca(cobranca.id, {
      externalPaymentId: String(pagamento.id),
      qrCode: dadosPix.qr_code,
      qrCodeBase64: dadosPix.qr_code_base64 ?? "",
      expiraEm: pagamento.date_of_expiration ?? expiraEm.toISOString(),
    });

    return NextResponse.json(
      {
        cobranca_id: atualizada.id,
        status: "pending",
        valor_centavos: atualizada.valor_centavos,
        vencimento: atualizada.vencimento,
        expira_em: atualizada.expira_em,
        pix_qr_code: atualizada.pix_qr_code,
        pix_qr_code_base64: atualizada.pix_qr_code_base64,
        external_payment_id: atualizada.external_payment_id,
      },
      { status: 201 },
    );
  } catch (erro) {
    console.error("[mercadopago/create]", erro);

    // Erro 400 do provedor é recusa do que mandamos (e-mail, valor, conta sem
    // chave PIX), não falha transitória: repetir não resolve. O texto do
    // Mercado Pago vem em inglês e técnico, então traduzimos o que é conhecido.
    const recusa =
      erro && typeof erro === "object" && "status" in erro && erro.status === 400
        ? ((erro as { message?: string }).message ?? "")
        : null;

    if (recusa === null) {
      return NextResponse.json(
        { erro: "Não foi possível gerar o PIX. Tente novamente." },
        { status: 500 },
      );
    }

    const semChavePix = /key enabled for qr/i.test(recusa);

    return NextResponse.json(
      {
        erro: semChavePix
          ? "Pagamento por PIX indisponível: a chave PIX do dojo ainda não " +
            "está cadastrada no Mercado Pago. Use o cartão ou procure a " +
            "secretaria."
          : "O Mercado Pago recusou a cobrança. Avise a secretaria do dojo.",
      },
      { status: 422 },
    );
  }
}
