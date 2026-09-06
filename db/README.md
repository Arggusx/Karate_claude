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
