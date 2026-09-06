-- =============================================================================
-- Pagamento voluntário: baixa manual pelo professor ou admin.
--
-- O aluno pode pagar em espécie ao professor/proprietário, no PIX pessoal
-- deles, ou pelo próprio portal. A mensalidade nasce em aberto todo dia 1º e
-- só é quitada quando alguém dá baixa ou quando o pagamento online é
-- aprovado. Não existe plano nem assinatura.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

-- Quem lançou a baixa (professor ou admin).
ALTER TABLE mensalidades ADD COLUMN IF NOT EXISTS pago_por INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mensalidades_pago_por_fkey'
  ) THEN
    ALTER TABLE mensalidades
      ADD CONSTRAINT mensalidades_pago_por_fkey
      FOREIGN KEY (pago_por) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Formas de recebimento presencial entram no vocabulário.
ALTER TABLE mensalidades DROP CONSTRAINT IF EXISTS mensalidades_payment_method_check;
ALTER TABLE mensalidades
  ADD CONSTRAINT mensalidades_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN (
    'pix',              -- PIX gerado pelo portal (Mercado Pago)
    'credit_card',      -- cartão avulso (Stripe)
    'stripe',
    'dinheiro',         -- espécie, na mão do professor ou do proprietário
    'pix_presencial',   -- PIX direto para a chave pessoal do professor/admin
    'transferencia'     -- TED/depósito
  ));

-- `provedor` passa a aceitar o lançamento manual.
ALTER TABLE mensalidades DROP CONSTRAINT IF EXISTS mensalidades_provedor_check;
ALTER TABLE mensalidades
  ADD CONSTRAINT mensalidades_provedor_check
  CHECK (provedor IS NULL
         OR provedor IN ('stripe', 'mercadopago', 'manual'));

-- ------------------------------------------------ trilha de lançamentos -----
-- Histórico de baixas e estornos: quem fez, quando, como e por quê. Nunca é
-- apagado — o estorno entra como um novo lançamento, não como exclusão.
CREATE TABLE IF NOT EXISTS mensalidade_lancamentos (
  id              BIGSERIAL PRIMARY KEY,
  mensalidade_id  INTEGER NOT NULL REFERENCES mensalidades(id) ON DELETE CASCADE,
  acao            VARCHAR(10) NOT NULL CHECK (acao IN ('baixa', 'estorno')),
  forma           VARCHAR(20),
  autor_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  autor_nome      VARCHAR(120) NOT NULL,
  observacao      TEXT,
  criado_em       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS mensalidade_lancamentos_mensalidade_idx
  ON mensalidade_lancamentos (mensalidade_id, criado_em DESC);

-- Observação: ao estornar, `observacao` da mensalidade é limpa (a nota fica
-- preservada no lançamento correspondente em mensalidade_lancamentos).

COMMIT;
