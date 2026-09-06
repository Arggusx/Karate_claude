-- =============================================================================
-- Portal Shotokan — infraestrutura de cobranças (Mercado Pago PIX + Stripe)
-- Projeto Neon: karate (restless-brook-09996777)
--
-- IMPORTANTE: o banco já existia com `users`, `alunos_perfil` e `mensalidades`
-- usando chaves INTEGER (SERIAL). Esta migração ESTENDE o schema existente em
-- vez de criar uma tabela `payments` paralela em UUID — duas tabelas para o
-- mesmo fato significariam duas fontes de verdade. O mapeamento com a
-- especificação original está documentado em db/README.md.
--
-- Toda a migração é aditiva e idempotente: pode rodar mais de uma vez.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------- users -----
-- `usuario` é a credencial de login (ver decisão de UX: login por nome de
-- usuário, e-mail apenas para contato e comprovantes).
ALTER TABLE users ADD COLUMN IF NOT EXISTS usuario VARCHAR(60);
ALTER TABLE users ADD COLUMN IF NOT EXISTS financial_status VARCHAR(20) NOT NULL DEFAULT 'pendente';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mercadopago_customer_id VARCHAR(255);

-- Preenche `usuario` apenas onde ainda está nulo (prefixo do e-mail).
UPDATE users
   SET usuario = lower(split_part(email, '@', 1))
 WHERE usuario IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_usuario_key ON users (usuario);
CREATE INDEX IF NOT EXISTS users_financial_status_idx ON users (financial_status);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_financial_status_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_financial_status_check
      CHECK (financial_status IN ('ativo', 'pendente', 'atrasado'));
  END IF;
END $$;

-- --------------------------------------------------------- mensalidades -----
-- Colunas exigidas pela integração de pagamento.
ALTER TABLE mensalidades ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);
ALTER TABLE mensalidades ADD COLUMN IF NOT EXISTS external_payment_id VARCHAR(255);
ALTER TABLE mensalidades ADD COLUMN IF NOT EXISTS pix_qr_code TEXT;
ALTER TABLE mensalidades ADD COLUMN IF NOT EXISTS pix_qr_code_base64 TEXT;
ALTER TABLE mensalidades ADD COLUMN IF NOT EXISTS expira_em TIMESTAMP WITH TIME ZONE;

-- Uma cobrança por aluno por competência: torna o cron job idempotente.
CREATE UNIQUE INDEX IF NOT EXISTS mensalidades_aluno_competencia_key
  ON mensalidades (aluno_id, competencia);

CREATE INDEX IF NOT EXISTS mensalidades_status_idx ON mensalidades (status);
CREATE INDEX IF NOT EXISTS mensalidades_external_payment_id_idx
  ON mensalidades (external_payment_id);

ALTER TABLE mensalidades DROP CONSTRAINT IF EXISTS mensalidades_payment_method_check;
ALTER TABLE mensalidades
  ADD CONSTRAINT mensalidades_payment_method_check
  CHECK (payment_method IS NULL
         OR payment_method IN ('pix', 'credit_card', 'stripe'));

-- ATENÇÃO: estes dois CHECK já existiam no banco com o vocabulário antigo, e
-- precisam ser RECRIADOS (não basta "criar se não existir" — o nome já está
-- ocupado por uma definição mais restrita que rejeita 'pending'/'approved').
ALTER TABLE mensalidades DROP CONSTRAINT IF EXISTS mensalidades_status_check;
ALTER TABLE mensalidades
  ADD CONSTRAINT mensalidades_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'expired',
                    'aberta', 'paga', 'cancelada'));

-- pago_em preenchido se, e somente se, a cobrança estiver quitada.
ALTER TABLE mensalidades DROP CONSTRAINT IF EXISTS mensalidades_pago_coerente;
ALTER TABLE mensalidades
  ADD CONSTRAINT mensalidades_pago_coerente
  CHECK (
    (status IN ('paga', 'approved') AND pago_em IS NOT NULL)
    OR (status NOT IN ('paga', 'approved') AND pago_em IS NULL)
  );

-- ------------------------------------------------------- webhook_events -----
-- Registro de eventos recebidos: garante idempotência (o Mercado Pago e a
-- Stripe reenviam a mesma notificação várias vezes) e deixa trilha de auditoria.
CREATE TABLE IF NOT EXISTS webhook_events (
  id              BIGSERIAL PRIMARY KEY,
  provedor        VARCHAR(20)  NOT NULL,
  evento_id       VARCHAR(255) NOT NULL,
  tipo            VARCHAR(80),
  payload         JSONB,
  processado_em   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provedor, evento_id)
);

CREATE INDEX IF NOT EXISTS webhook_events_provedor_idx ON webhook_events (provedor);

COMMIT;
