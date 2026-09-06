# Banco de dados — Portal Shotokan

Projeto Neon: **karate** (`restless-brook-09996777`), região `aws-sa-east-1`.

## Por que não existe uma tabela `payments` em UUID

A especificação pedia uma tabela `payments` com `id UUID`. O banco **já existia**
com `users`, `alunos_perfil`, `turmas` e `mensalidades` usando chaves `INTEGER`
(SERIAL) e com dados dentro. Criar uma tabela nova em UUID para o mesmo fato
deixaria duas fontes de verdade para "a mensalidade do aluno X no mês Y" e
quebraria as foreign keys existentes.

A migração `001_pagamentos.sql` estende `mensalidades` e `users`. Mapeamento:

| Especificação          | Coluna real em `mensalidades`        |
| ---------------------- | ------------------------------------ |
| `id` (UUID)            | `id` (INTEGER, já existente)         |
| `student_id`           | `aluno_id` → `users.id`              |
| `amount` DECIMAL(10,2) | `valor_centavos` INTEGER (já existia)|
| `status`               | `status`                             |
| `payment_method`       | `payment_method` *(novo)*            |
| `external_payment_id`  | `external_payment_id` *(novo)*       |
| `pix_qr_code`          | `pix_qr_code` *(novo)*               |
| `pix_qr_code_base64`   | `pix_qr_code_base64` *(novo)*        |
| `due_date`             | `vencimento` DATE (já existia)       |
| `paid_at`              | `pago_em` (já existia)               |
| `created_at`           | `criado_em` (já existia)             |
| —                      | `competencia` DATE — mês de referência|
| —                      | `expira_em` *(novo)* — validade do PIX|

Valor em **centavos** (`INTEGER`) foi mantido de propósito: evita erro de
arredondamento de ponto flutuante, e é o formato que Mercado Pago e Stripe usam.

## Vocabulário de status

Novo: `pending`, `approved`, `rejected`, `cancelled`, `expired`.
Legado ainda aceito pelo CHECK: `aberta`, `paga` (3 registros antigos).
`src/server/pagamentos.ts` trata os dois. Para normalizar, rode
`002_normalizar_status.sql` — ele altera dados existentes.

## Como aplicar

```bash
psql "$DATABASE_URL" -f db/migrations/001_pagamentos.sql
```

A `001` já foi aplicada no projeto `karate`. Ela é idempotente.

## Progresso para o exame (migration 005)

O progresso deixou de ser um número guardado. `alunos_perfil.progresso` e
`alunos_perfil.frequencia` continuam existindo por compatibilidade, mas não são
mais a fonte da verdade: `/api/academia` calcula os dois a cada leitura em
`src/server/progresso.ts`.

| Critério | Peso | De onde sai |
|---|---|---|
| Programa técnico | 40% | `programa_concluido` sobre os itens da graduação (JSON) |
| Tempo na faixa | 25% | `alunos_perfil.data_graduacao` sobre o `tempoMinimo` da faixa |
| Aulas assistidas | 25% | `presencas` desde a graduação sobre o mínimo esperado |
| Mensalidade | 10% | `alunos_perfil.status_mensalidade` |

O mínimo de aulas vem de `aulasExigidas()`: meses exigidos × 4,345 semanas ×
3 aulas por semana × 75% de frequência mínima.

`presencas` guarda também as faltas (`presente = false`), não só as presenças —
sem o denominador não há como calcular frequência. Uma linha em `aulas` por
turma e data, garantida pelo índice único `aulas_turma_data_idx`.
