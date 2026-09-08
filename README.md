# Torakan — Academia Tigre de Karatê

Site e sistema de gestão da **Academia Tigre de Karatê**, um dojo de Karatê
Shotokan. "Torakan" (虎館, *casa do tigre*) é o nome fantasia usado na marca; o
nome de registro aparece no rodapé, nos metadados e nas cobranças.

O projeto é **duas coisas em um só lugar**, e essa é a decisão central de
produto: um site de captação para quem ainda não treina, e um sistema de gestão
para quem já treina. Um visitante encontra horários, mensalidade e o acervo de
estudos; um aluno matriculado entra no portal e vê a própria frequência, o
progresso para o exame e paga a mensalidade.

---

## Para que serve

### Para quem procura uma academia
A página inicial apresenta o dojo, as duas turmas com horários, a mensalidade e
os benefícios do treino. Nenhum cadastro é necessário.

### Para quem quer estudar Karatê
O **Portal de Estudos** é aberto e não exige login. Reúne o acervo completo:

- **História** — linha do tempo de Okinawa aos dias atuais e a linhagem dos
  mestres, do Japão até a chegada ao Brasil
- **Técnicas** — 56 técnicas de kihon agrupadas por categoria e 26 katas com
  ficha técnica, bunkai e sequência de movimentos
- **Fundamentos** — sistema de faixas Kyu/Dan com o programa exigido em cada
  exame, Dojo Kun, Niju Kun, etiqueta e princípios técnicos

### Para o aluno matriculado
O **Portal do Aluno** mostra a turma e o quadro de horários com o conteúdo de
cada aula, a frequência, o progresso para o próximo exame com os quatro
critérios abertos, e o pagamento da mensalidade por PIX ou cartão.

### Para o professor
O **Portal do Professor** administra as turmas e o plano de aulas, faz a chamada
com registro no banco, cadastra alunos, consulta a situação financeira e dá
baixa em pagamentos recebidos em mãos.

### Para o administrador
O **Portal do Admin** faz tudo o que o professor faz, mais o cadastro de
professores — só o admin cria contas de professor — e a visão financeira
completa.

---

## Como o dojo funciona (regras que o sistema implementa)

Estas não são decisões técnicas; são as regras da academia, e o código as segue.

- **Duas turmas.** Infantil (7 a 12 anos, 18:30 às 19:30) e Avançado (13 anos ou
  mais, 19:30 às 20:30). A divisão é por faixa etária, não por graduação.
- **Três aulas por semana**, terça, quinta e sexta.
- **Mensalidade única.** Um valor só, igual para qualquer idade e qualquer
  faixa. Não existem planos.
- **Pagamento voluntário.** O aluno pode pagar pelo portal, mas também pode
  pagar em dinheiro ou PIX direto ao professor — nesse caso professor ou admin
  dá baixa no sistema. A cobrança do mês fica aberta até que uma das duas coisas
  aconteça.
- **A chamada tem falta como padrão.** Só quem for marcado conta presença.
- **Progresso para o exame** é calculado, não digitado. Quatro critérios com
  peso: programa técnico validado pelo professor (40%), tempo na faixa (25%),
  aulas assistidas (25%) e mensalidade em dia (10%). A frequência mínima
  exigida é 75%.

---

## Tecnologia

| Camada | O quê |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS, tema claro/escuro com `next-themes` |
| Banco | PostgreSQL na Neon, via driver HTTP serverless |
| Pagamentos | Mercado Pago (PIX) e Stripe (cartão) |
| Animação | GSAP, apenas na abertura da landing |
| Hospedagem | Vercel, com um cron mensal |

**Autenticação** é por cookie de sessão assinado com HMAC-SHA256, `httpOnly` e
`SameSite=lax`, válido por 12 horas. Senhas são guardadas com bcrypt. O
navegador nunca decide quem é o usuário — quem responde isso é o servidor, a
cada requisição.

---

## Rodando localmente

Requer **Node 18.18 ou superior** — o piso do Next 15, declarado em
`package.json`. Desenvolvido no Node 24.

```bash
npm install
npm run dev
```

O site sobe em `http://localhost:3000`.

### Variáveis de ambiente

Crie um `.env.local` na raiz. O build funciona sem elas, mas o site em execução
não — a conexão com o banco é criada na primeira consulta, não na importação do
módulo, justamente para o `next build` não precisar de banco.

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Connection string do Postgres na Neon |
| `SESSION_SECRET` | Chave de assinatura do cookie de sessão (mínimo 32 caracteres) |
| `CRON_SECRET` | Protege a rota do cron mensal |
| `APP_URL` | URL pública do site, usada no retorno do checkout |
| `VALOR_MENSALIDADE_CENTAVOS` | Mensalidade em centavos (ex.: `5000` = R$ 50,00) |
| `MERCADOPAGO_ACCESS_TOKEN` | Credencial do Mercado Pago |
| `MERCADOPAGO_WEBHOOK_URL` | URL que o Mercado Pago chama ao confirmar o PIX |
| `MERCADOPAGO_WEBHOOK_SECRET` | Valida a assinatura do webhook |
| `STRIPE_SECRET_KEY` | Credencial da Stripe |
| `STRIPE_WEBHOOK_SECRET` | Valida a assinatura do webhook |

> A conta do Mercado Pago precisa ter **chave PIX cadastrada**, senão a geração
> do QR Code falha com "Collector user without key enabled for QR render".

### Banco de dados

As migrations ficam em `db/migrations/`, numeradas e aplicadas em ordem. O
`db/README.md` explica o mapeamento das tabelas e por que o schema estende o
que já existia em vez de criar um paralelo.

---

## Estrutura

```
src/
  app/          Rotas (App Router): páginas e API
  components/   Componentes de interface, agrupados por área
  server/       Acesso ao banco e regras — nunca importado pelo cliente
  services/     Acervo de Karatê (JSON) e funções de apresentação
  lib/          Conexão com o banco e estado compartilhado do cliente
  types/        Tipagens do domínio
db/migrations/  Evolução do schema, em ordem
public/imagens/ Fotos e a marca — com CREDITOS.md registrando a licença de cada arquivo
```

O acervo de Karatê vive em `karate_shotokan_dados_completos.json`, na raiz. É
conteúdo, não código: katas, técnicas, linha do tempo, graduações e princípios.

---

## Convenções do código

- **Código e comentários em português.** Nomes de variáveis, funções e
  componentes seguem o domínio em português (`aluno`, `mensalidade`, `faixa`),
  porque é assim que o dojo fala.
- **`src/server/` é servidor e ponto final.** Todo arquivo ali importa
  `server-only`; se algum componente de cliente tentar puxá-lo, o build quebra
  de propósito.
- **Comentário explica o porquê, não o quê.** Se um trecho existe para
  contornar um comportamento específico de um provedor ou do navegador, isso
  está escrito ali.

---

## Licença das imagens

Todas as fotos vêm de bancos de uso livre e estão registradas em
[`public/imagens/CREDITOS.md`](public/imagens/CREDITOS.md), com origem e
licença de cada arquivo. A marca é arte própria da academia.
