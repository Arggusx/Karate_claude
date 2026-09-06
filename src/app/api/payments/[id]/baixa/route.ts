import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import {
  buscarCobranca,
  darBaixaManual,
  definirStatusFinanceiro,
  estaPaga,
  listarCobrancasDoAluno,
  type FormaBaixa,
} from "@/server/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMAS: FormaBaixa[] = ["dinheiro", "pix_presencial", "transferencia"];

/**
 * POST /api/payments/:id/baixa
 *
 * Corpo: { forma, observacao? }
 *
 * Registra que a mensalidade foi paga fora do portal — em espécie, no PIX
 * pessoal do professor/proprietário ou por transferência.
 *
 * Quem lançou vem do cookie de sessão assinado, nunca do corpo: só professor
 * e admin autenticados passam daqui.
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

  let corpo: { forma?: FormaBaixa; observacao?: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (!corpo.forma || !FORMAS.includes(corpo.forma)) {
    return NextResponse.json(
      { erro: `Forma inválida. Use uma de: ${FORMAS.join(", ")}.` },
      { status: 400 },
    );
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
    if (estaPaga(cobranca)) {
      return NextResponse.json(
        { erro: "Esta mensalidade já está quitada." },
        { status: 409 },
      );
    }

    const atualizada = await darBaixaManual(cobrancaId, {
      forma: corpo.forma,
      autorId: lancador.id,
      autorNome: lancador.nome,
      observacao: corpo.observacao?.trim() || null,
    });

    if (!atualizada) {
      return NextResponse.json(
        { erro: "Não foi possível dar baixa." },
        { status: 409 },
      );
    }

    // Sem nada em aberto, o aluno volta a constar como em dia.
    const restantes = await listarCobrancasDoAluno(atualizada.aluno_id, 60);
    const aindaAberto = restantes.some(
      (item) => item.status === "pending" || item.status === "aberta",
    );
    await definirStatusFinanceiro(
      atualizada.aluno_id,
      aindaAberto ? "pendente" : "ativo",
    );

    return NextResponse.json({
      ok: true,
      cobranca_id: atualizada.id,
      status: atualizada.status,
      pago_em: atualizada.pago_em,
      forma: atualizada.payment_method,
      lancado_por: lancador.nome,
      em_aberto_restantes: restantes.filter(
        (item) => item.status === "pending" || item.status === "aberta",
      ).length,
    });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[payments/baixa]", erro);
    return NextResponse.json(
      { erro: "Falha ao registrar a baixa." },
      { status: 500 },
    );
  }
}
