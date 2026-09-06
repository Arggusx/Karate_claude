import { NextResponse } from "next/server";
import { competenciaDoMes } from "@/lib/db";
import {
  VALOR_MENSALIDADE_CENTAVOS,
  definirStatusFinanceiro,
  garantirCobrancaDoMes,
  listarAlunosAtivos,
  listarSituacaoFinanceira,
} from "@/server/pagamentos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron mensal (dia 1º) — gera a mensalidade de todos os alunos ativos.
 *
 * O pagamento é voluntário: a mensalidade nasce em aberto e permanece assim
 * até que um professor ou o admin dê baixa (pagamento em espécie, PIX pessoal
 * ou transferência) ou até o aluno pagar pelo portal. Por isso o cron NÃO
 * marca ninguém como 'atrasado' — ele apenas mantém `financial_status`
 * coerente: 'pendente' com algo em aberto, 'ativo' sem nada em aberto.
 *
 * Protegido por CRON_SECRET: a Vercel envia `Authorization: Bearer <segredo>`.
 * Aceita GET (formato do Vercel Cron) e POST (disparo manual).
 */
async function executar(request: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) {
    return NextResponse.json(
      { erro: "CRON_SECRET não configurado." },
      { status: 500 },
    );
  }

  const autorizacao = request.headers.get("authorization");
  if (autorizacao !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const competencia = competenciaDoMes();

  try {
    // 1. Alunos ativos.
    const alunos = await listarAlunosAtivos();

    // 2. Uma cobrança pendente por aluno (índice único evita duplicar).
    const criadas: number[] = [];
    const falhas: { aluno_id: number; erro: string }[] = [];

    for (const aluno of alunos) {
      try {
        const cobranca = await garantirCobrancaDoMes(
          aluno.id,
          competencia,
          VALOR_MENSALIDADE_CENTAVOS,
        );
        criadas.push(cobranca.id);
      } catch (erro) {
        falhas.push({
          aluno_id: aluno.id,
          erro: erro instanceof Error ? erro.message : "desconhecido",
        });
      }
    }

    // 3. Situação financeira: 'pendente' se há algo em aberto, 'ativo' se não.
    //    Ninguém é marcado como 'atrasado' automaticamente.
    const situacao = await listarSituacaoFinanceira();

    for (const linha of situacao) {
      await definirStatusFinanceiro(
        linha.aluno_id,
        linha.em_aberto > 0 ? "pendente" : "ativo",
      );
    }

    return NextResponse.json({
      ok: true,
      competencia,
      alunos: alunos.length,
      cobrancas_garantidas: criadas.length,
      com_pendencia: situacao.filter((linha) => linha.em_aberto > 0).length,
      falhas,
    });
  } catch (erro) {
    console.error("[cron/generate-monthly-dues]", erro);
    return NextResponse.json(
      { erro: "Falha ao gerar as mensalidades." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return executar(request);
}

export async function POST(request: Request) {
  return executar(request);
}
