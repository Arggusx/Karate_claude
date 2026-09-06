-- =============================================================================
-- Turmas com horário completo e plano de aulas + contas de acesso no banco.
--
-- Substitui o estado que vivia no localStorage do navegador: turmas, alunos e
-- professores passam a ser lidos do Postgres.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------- turmas ----
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS hora_fim TIME;
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS faixa_etaria VARCHAR(60);
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS faixas_tipicas VARCHAR(120);
-- Plano semanal: [{ dia, foco, conteudo: [] }]
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS plano JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE turmas ADD COLUMN IF NOT EXISTS ativa BOOLEAN NOT NULL DEFAULT true;

-- ----------------------------------------------------------------- users ----
-- Senha guardada como hash scrypt no formato "scrypt$<salt>$<hash>".
-- `precisa_trocar_senha` já existia e é usado no primeiro acesso.
ALTER TABLE users ADD COLUMN IF NOT EXISTS idade SMALLINT;

-- --------------------------------------------------------- alunos_perfil ----
ALTER TABLE alunos_perfil ADD COLUMN IF NOT EXISTS progresso SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE alunos_perfil ADD COLUMN IF NOT EXISTS frequencia SMALLINT NOT NULL DEFAULT 100;
ALTER TABLE alunos_perfil ADD COLUMN IF NOT EXISTS proximo_exame VARCHAR(40);

CREATE UNIQUE INDEX IF NOT EXISTS alunos_perfil_user_key ON alunos_perfil (user_id);

COMMIT;
