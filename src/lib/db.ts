import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Cliente do Neon sobre HTTP — funciona em serverless/edge sem pool de
 * conexões. Use sempre como template tag para que os valores virem
 * parâmetros e nunca concatenação de string:
 *
 *   const linhas = await sql`SELECT * FROM users WHERE id = ${id}`;
 *
 * A conexão é criada na PRIMEIRA consulta, não na importação do módulo.
 * Isso é essencial para o build: o `next build` importa todas as rotas para
 * coletar metadados, e conectar nesse momento faria o build inteiro falhar
 * em qualquer ambiente sem DATABASE_URL.
 */

let clienteCache: NeonQueryFunction<false, false> | null = null;

function cliente(): NeonQueryFunction<false, false> {
  if (clienteCache) return clienteCache;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL não definida. Configure a connection string do Neon nas " +
        "variáveis de ambiente (local: .env.local; Vercel: Settings › " +
        "Environment Variables).",
    );
  }

  clienteCache = neon(url);
  return clienteCache;
}

export const sql = ((strings: TemplateStringsArray, ...valores: unknown[]) =>
  cliente()(strings, ...valores)) as unknown as NeonQueryFunction<false, false>;

/** Há conexão configurada? Útil para telas degradarem sem quebrar. */
export function bancoConfigurado(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Valor em centavos formatado como reais: 5000 → "50,00". */
export function centavosParaReais(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

/** Competência (mês de referência) normalizada para o dia 1º. */
export function competenciaDoMes(data = new Date()): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}-01`;
}
