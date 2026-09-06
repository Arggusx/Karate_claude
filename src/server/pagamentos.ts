import "server-only";
import { competenciaDoMes, sql } from "@/lib/db";

/**
 * Camada de acesso às cobranças. Todo SQL do sistema financeiro passa por
 * aqui; as rotas de API só orquestram.
 */

export type StatusCobranca =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "expired";

export type StatusFinanceiro = "ativo" | "pendente" | "atrasado";

/** Formas de recebimento presencial lançadas manualmente. */
export type FormaBaixa = "dinheiro" | "pix_presencial" | "transferencia";

export const FORMAS_BAIXA: { valor: FormaBaixa; label: string }[] = [
  { valor: "dinheiro", label: "Dinheiro (espécie)" },
  { valor: "pix_presencial", label: "PIX direto ao professor/admin" },
  { valor: "transferencia", label: "Transferência / depósito" },
];

/** Status legados que ainda existem no banco (ver db/README.md). */
const PENDENTES = ["pending", "aberta"] as const;
const APROVADOS = ["approved", "paga"] as const;

export interface Cobranca {
  id: number;
  aluno_id: number;
  competencia: string;
  valor_centavos: number;
  vencimento: string;
  status: string;
  pago_em: string | null;
  /** Quem processou: "mercadopago", "stripe" ou "manual". */
  provedor: string | null;
  payment_method: string | null;
  external_payment_id: string | null;
  pix_qr_code: string | null;
  pix_qr_code_base64: string | null;
  expira_em: string | null;
  pago_por: number | null;
  observacao: string | null;
  criado_em: string;
}

export interface Lancamento {
  id: number;
  mensalidade_id: number;
  acao: "baixa" | "estorno";
  forma: string | null;
  autor_id: number | null;
  autor_nome: string;
  observacao: string | null;
  criado_em: string;
}

export interface Aluno {
  id: number;
  nome: string;
  email: string;
  usuario: string | null;
  ativo: boolean;
  financial_status: StatusFinanceiro;
  stripe_customer_id: string | null;
  mercadopago_customer_id: string | null;
}

export const VALOR_MENSALIDADE_CENTAVOS = Number(
  process.env.VALOR_MENSALIDADE_CENTAVOS ?? 5000,
);

// ------------------------------------------------------------------ alunos

export async function buscarAluno(
  identificador: { id?: number; usuario?: string },
): Promise<Aluno | null> {
  const linhas = identificador.id
    ? await sql`
        SELECT u.id, u.nome, u.email, u.usuario, u.ativo, u.financial_status,
               u.stripe_customer_id, u.mercadopago_customer_id
          FROM users u
         WHERE u.id = ${identificador.id}
           AND EXISTS (SELECT 1 FROM alunos_perfil p WHERE p.user_id = u.id)`
    : await sql`
        SELECT u.id, u.nome, u.email, u.usuario, u.ativo, u.financial_status,
               u.stripe_customer_id, u.mercadopago_customer_id
          FROM users u
         WHERE u.usuario = ${identificador.usuario}
           AND EXISTS (SELECT 1 FROM alunos_perfil p WHERE p.user_id = u.id)`;

  return (linhas[0] as Aluno) ?? null;
}

/**
 * A situação financeira vive em dois lugares: `users.financial_status` (usado
 * pelas APIs) e `alunos_perfil.status_mensalidade` (usado pelas telas antigas
 * do professor). As duas escritas vão num único statement para que uma falha
 * no meio não deixe os valores divergentes.
 */
export async function definirStatusFinanceiro(
  alunoId: number,
  status: StatusFinanceiro,
): Promise<void> {
  await sql`
    WITH conta AS (
      UPDATE users SET financial_status = ${status} WHERE id = ${alunoId}
      RETURNING id
    )
    UPDATE alunos_perfil
       SET status_mensalidade = ${status}, atualizado_em = CURRENT_TIMESTAMP
     WHERE user_id = (SELECT id FROM conta)`;
}

// --------------------------------------------------------------- cobranças

export async function buscarCobrancaDoMes(
  alunoId: number,
  competencia = competenciaDoMes(),
): Promise<Cobranca | null> {
  const linhas = await sql`
    SELECT * FROM mensalidades
     WHERE aluno_id = ${alunoId} AND competencia = ${competencia}::date
     LIMIT 1`;
  return (linhas[0] as Cobranca) ?? null;
}

export async function buscarCobranca(id: number): Promise<Cobranca | null> {
  const linhas = await sql`SELECT * FROM mensalidades WHERE id = ${id} LIMIT 1`;
  return (linhas[0] as Cobranca) ?? null;
}

export async function buscarCobrancaPorReferenciaExterna(
  externalPaymentId: string,
): Promise<Cobranca | null> {
  const linhas = await sql`
    SELECT * FROM mensalidades
     WHERE external_payment_id = ${externalPaymentId}
     ORDER BY id DESC LIMIT 1`;
  return (linhas[0] as Cobranca) ?? null;
}

export function estaPaga(cobranca: Cobranca): boolean {
  return (APROVADOS as readonly string[]).includes(cobranca.status);
}

export function estaPendente(cobranca: Cobranca): boolean {
  return (PENDENTES as readonly string[]).includes(cobranca.status);
}

/**
 * Cria a cobrança do mês se ela ainda não existir. O índice único
 * (aluno_id, competencia) garante que chamadas concorrentes não dupliquem.
 */
export async function garantirCobrancaDoMes(
  alunoId: number,
  competencia = competenciaDoMes(),
  valorCentavos = VALOR_MENSALIDADE_CENTAVOS,
): Promise<Cobranca> {
  const vencimento = vencimentoDaCompetencia(competencia);

  await sql`
    INSERT INTO mensalidades
      (aluno_id, competencia, valor_centavos, vencimento, status)
    VALUES
      (${alunoId}, ${competencia}::date, ${valorCentavos}, ${vencimento}::date, 'pending')
    ON CONFLICT (aluno_id, competencia) DO NOTHING`;

  const cobranca = await buscarCobrancaDoMes(alunoId, competencia);
  if (!cobranca) throw new Error("Falha ao criar a cobrança do mês.");
  return cobranca;
}

/** Vencimento padrão: dia 10 da competência. */
export function vencimentoDaCompetencia(competencia: string): string {
  return `${competencia.slice(0, 7)}-10`;
}

export async function registrarPixNaCobranca(
  id: number,
  dados: {
    externalPaymentId: string;
    qrCode: string;
    qrCodeBase64: string;
    expiraEm: string | null;
  },
): Promise<Cobranca> {
  const linhas = await sql`
    UPDATE mensalidades
       SET payment_method       = 'pix',
           provedor             = 'mercadopago',
           external_payment_id  = ${dados.externalPaymentId},
           provedor_ref         = ${dados.externalPaymentId},
           pix_qr_code          = ${dados.qrCode},
           pix_qr_code_base64   = ${dados.qrCodeBase64},
           expira_em            = ${dados.expiraEm},
           status               = 'pending',
           atualizado_em        = CURRENT_TIMESTAMP
     WHERE id = ${id}
     RETURNING *`;
  return linhas[0] as Cobranca;
}

export async function registrarCheckoutStripe(
  id: number,
  sessionId: string,
): Promise<void> {
  await sql`
    UPDATE mensalidades
       SET payment_method      = 'stripe',
           provedor            = 'stripe',
           external_payment_id = ${sessionId},
           provedor_ref        = ${sessionId},
           status              = 'pending',
           atualizado_em       = CURRENT_TIMESTAMP
     WHERE id = ${id}`;
}

/**
 * Aplica o status vindo do provedor. Só marca `pago_em` na primeira
 * aprovação, para o reenvio de webhook não sobrescrever a data original.
 */
export async function aplicarStatusDoProvedor(
  id: number,
  status: StatusCobranca,
  provedorStatus?: string,
): Promise<Cobranca | null> {
  const linhas = await sql`
    UPDATE mensalidades
       SET status          = ${status},
           provedor_status = ${provedorStatus ?? null},
           pago_em         = CASE
                               WHEN ${status} = 'approved' AND pago_em IS NULL
                                 THEN CURRENT_TIMESTAMP
                               ELSE pago_em
                             END,
           atualizado_em   = CURRENT_TIMESTAMP
     WHERE id = ${id}
     RETURNING *`;
  return (linhas[0] as Cobranca) ?? null;
}

// ------------------------------------------------- baixa manual / estorno

/** Quem pode lançar baixa: professor ou admin. */
export async function buscarLancador(
  usuario: string,
): Promise<{ id: number; nome: string; role: string } | null> {
  const linhas = await sql`
    SELECT id, nome, role FROM users
     WHERE usuario = ${usuario} AND role IN ('professor', 'admin') AND ativo = true
     LIMIT 1`;
  return (linhas[0] as { id: number; nome: string; role: string }) ?? null;
}

/**
 * Dá baixa em uma mensalidade recebida fora do portal (espécie, PIX pessoal
 * ou transferência). Registra forma, autor e observação na trilha.
 */
export async function darBaixaManual(
  cobrancaId: number,
  dados: {
    forma: FormaBaixa;
    autorId: number;
    autorNome: string;
    observacao?: string | null;
  },
): Promise<Cobranca | null> {
  const linhas = await sql`
    UPDATE mensalidades
       SET status         = 'approved',
           payment_method = ${dados.forma},
           provedor       = 'manual',
           pago_por       = ${dados.autorId},
           pago_em        = COALESCE(pago_em, CURRENT_TIMESTAMP),
           observacao     = ${dados.observacao ?? null},
           atualizado_em  = CURRENT_TIMESTAMP
     WHERE id = ${cobrancaId}
       AND status NOT IN ('approved', 'paga')
     RETURNING *`;

  const cobranca = (linhas[0] as Cobranca) ?? null;
  if (!cobranca) return null;

  await sql`
    INSERT INTO mensalidade_lancamentos
      (mensalidade_id, acao, forma, autor_id, autor_nome, observacao)
    VALUES
      (${cobrancaId}, 'baixa', ${dados.forma}, ${dados.autorId},
       ${dados.autorNome}, ${dados.observacao ?? null})`;

  return cobranca;
}

/**
 * Desfaz uma baixa lançada por engano: a cobrança volta a ficar em aberto e o
 * estorno entra como novo lançamento (o histórico nunca é apagado).
 */
export async function estornarBaixa(
  cobrancaId: number,
  dados: { autorId: number; autorNome: string; motivo?: string | null },
): Promise<Cobranca | null> {
  const linhas = await sql`
    UPDATE mensalidades
       SET status         = 'pending',
           payment_method = NULL,
           provedor       = NULL,
           pago_por       = NULL,
           pago_em        = NULL,
           observacao     = NULL,
           atualizado_em  = CURRENT_TIMESTAMP
     WHERE id = ${cobrancaId}
       AND status IN ('approved', 'paga')
       AND provedor IS NOT DISTINCT FROM 'manual'
     RETURNING *`;

  const cobranca = (linhas[0] as Cobranca) ?? null;
  if (!cobranca) return null;

  await sql`
    INSERT INTO mensalidade_lancamentos
      (mensalidade_id, acao, autor_id, autor_nome, observacao)
    VALUES
      (${cobrancaId}, 'estorno', ${dados.autorId}, ${dados.autorNome},
       ${dados.motivo ?? null})`;

  return cobranca;
}

export async function listarLancamentos(
  cobrancaId: number,
): Promise<Lancamento[]> {
  const linhas = await sql`
    SELECT * FROM mensalidade_lancamentos
     WHERE mensalidade_id = ${cobrancaId}
     ORDER BY criado_em DESC`;
  return linhas as Lancamento[];
}

/** Mensalidades de um aluno, mais recentes primeiro. */
export async function listarCobrancasDoAluno(
  alunoId: number,
  limite = 12,
): Promise<Cobranca[]> {
  const linhas = await sql`
    SELECT * FROM mensalidades
     WHERE aluno_id = ${alunoId}
     ORDER BY competencia DESC
     LIMIT ${limite}`;
  return linhas as Cobranca[];
}

/** Panorama financeiro para as telas de professor e admin. */
export async function listarSituacaoFinanceira(): Promise<
  {
    aluno_id: number;
    nome: string;
    usuario: string | null;
    financial_status: StatusFinanceiro;
    em_aberto: number;
    total_aberto_centavos: number;
    competencia_mais_antiga: string | null;
  }[]
> {
  const linhas = await sql`
    SELECT u.id            AS aluno_id,
           u.nome,
           u.usuario,
           u.financial_status,
           count(m.id) FILTER (WHERE m.status IN ('pending', 'aberta'))::int AS em_aberto,
           COALESCE(sum(m.valor_centavos) FILTER (WHERE m.status IN ('pending', 'aberta')), 0)::int
             AS total_aberto_centavos,
           min(m.competencia) FILTER (WHERE m.status IN ('pending', 'aberta'))
             AS competencia_mais_antiga
      FROM users u
      LEFT JOIN mensalidades m ON m.aluno_id = u.id
     WHERE u.ativo = true
       AND EXISTS (SELECT 1 FROM alunos_perfil ap WHERE ap.user_id = u.id)
     GROUP BY u.id, u.nome, u.usuario, u.financial_status
     ORDER BY em_aberto DESC, u.nome`;
  return linhas as never;
}

// ----------------------------------------------------------- idempotência

/**
 * Registra o evento do webhook. Retorna false se ele já tinha sido
 * processado — os dois provedores reenviam a mesma notificação.
 */
export async function registrarEventoWebhook(
  provedor: "mercadopago" | "stripe",
  eventoId: string,
  tipo: string | null,
  payload: unknown,
): Promise<boolean> {
  const linhas = await sql`
    INSERT INTO webhook_events (provedor, evento_id, tipo, payload)
    VALUES (${provedor}, ${eventoId}, ${tipo}, ${JSON.stringify(payload)}::jsonb)
    ON CONFLICT (provedor, evento_id) DO NOTHING
    RETURNING id`;
  return linhas.length > 0;
}

/**
 * Desfaz o registro do evento quando o processamento falhou, para que a
 * retentativa do provedor volte a ser aceita. Sem isso, uma falha temporária
 * (banco fora do ar, constraint inesperada) bloquearia o evento para sempre.
 */
export async function descartarEventoWebhook(
  provedor: "mercadopago" | "stripe",
  eventoId: string,
): Promise<void> {
  await sql`
    DELETE FROM webhook_events
     WHERE provedor = ${provedor} AND evento_id = ${eventoId}`;
}

// ------------------------------------------------------------ cron mensal

export async function listarAlunosAtivos(): Promise<Aluno[]> {
  const linhas = await sql`
    SELECT u.id, u.nome, u.email, u.usuario, u.ativo, u.financial_status,
           u.stripe_customer_id, u.mercadopago_customer_id
      FROM users u
     WHERE u.ativo = true
       AND EXISTS (SELECT 1 FROM alunos_perfil p WHERE p.user_id = u.id)
     ORDER BY u.id`;
  return linhas as Aluno[];
}
