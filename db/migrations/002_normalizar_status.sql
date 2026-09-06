-- =============================================================================
-- OPCIONAL — NÃO APLICADO AUTOMATICAMENTE.
--
-- O banco tinha 3 mensalidades com o vocabulário legado ('aberta', 'paga').
-- Rodar este script normaliza esses registros para o vocabulário da
-- especificação. É uma alteração de dados existentes, então fica sob decisão
-- explícita — o código da aplicação já lida com os dois vocabulários.
-- =============================================================================

BEGIN;

UPDATE mensalidades SET status = 'pending'  WHERE status = 'aberta';
UPDATE mensalidades SET status = 'approved' WHERE status = 'paga';

-- Depois de normalizar, o CHECK pode ficar restrito ao vocabulário novo:
-- ALTER TABLE mensalidades DROP CONSTRAINT mensalidades_status_check;
-- ALTER TABLE mensalidades ADD CONSTRAINT mensalidades_status_check
--   CHECK (status IN ('pending','approved','rejected','cancelled','expired'));

COMMIT;
