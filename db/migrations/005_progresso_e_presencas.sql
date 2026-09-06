-- =============================================================================
-- 005 — Critérios de progresso para o exame e persistência da chamada.
--
-- Antes disto, `alunos_perfil.frequencia` era um número fixo (100) e a chamada
-- do diário vivia apenas no estado do navegador: nada era gravado. Sem histórico
-- de presença não há como calcular dois dos quatro critérios de exame.
--
-- Também muda a semana de treino de 2 para 3 dias (terça, quinta e sexta).
-- =============================================================================

BEGIN;

-- 1. Desde quando o aluno está na faixa atual. É a base do critério de tempo
--    mínimo; sem ela não há de onde contar os meses.
ALTER TABLE alunos_perfil
  ADD COLUMN IF NOT EXISTS data_graduacao DATE;

-- 2. Uma aula por turma e data. O índice único torna a chamada idempotente:
--    salvar duas vezes o mesmo dia atualiza, não duplica.
CREATE UNIQUE INDEX IF NOT EXISTS aulas_turma_data_idx
  ON aulas (turma_id, data_aula);

-- 3. Presença. Ausência de linha e presente = false significam a mesma coisa:
--    o padrão da chamada é falta, como pedido.
CREATE TABLE IF NOT EXISTS presencas (
  id             SERIAL PRIMARY KEY,
  aula_id        INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
  aluno_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  presente       BOOLEAN NOT NULL DEFAULT false,
  registrado_por INTEGER REFERENCES users(id),
  criado_em      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (aula_id, aluno_id)
);

CREATE INDEX IF NOT EXISTS presencas_aluno_idx ON presencas (aluno_id);

-- 4. Itens do programa técnico que o professor já validou. A faixa alvo entra
--    na chave para o histórico não se perder quando o aluno gradua.
CREATE TABLE IF NOT EXISTS programa_concluido (
  id           SERIAL PRIMARY KEY,
  aluno_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  faixa_alvo   VARCHAR(60) NOT NULL,
  tipo         VARCHAR(10) NOT NULL CHECK (tipo IN ('kata', 'kihon')),
  item         VARCHAR(160) NOT NULL,
  autor_id     INTEGER REFERENCES users(id),
  concluido_em TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (aluno_id, faixa_alvo, tipo, item)
);

CREATE INDEX IF NOT EXISTS programa_concluido_aluno_idx
  ON programa_concluido (aluno_id);

-- 5. Três dias de treino por semana. Horários inalterados.
UPDATE turmas SET dias_semana = 'Terça, Quinta e Sexta' WHERE ativa = true;

-- 6. Quem já estava matriculado não tem data de graduação registrada. Sem um
--    valor, o critério de tempo fica em 0% e a barra some. Usar a data de
--    entrada no sistema é a aproximação honesta disponível.
UPDATE alunos_perfil p
   SET data_graduacao = COALESCE(
         p.data_graduacao,
         (SELECT u.criado_em::date FROM users u WHERE u.id = p.user_id),
         CURRENT_DATE
       )
 WHERE p.data_graduacao IS NULL;

COMMIT;
