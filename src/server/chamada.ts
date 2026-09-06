import "server-only";
import { sql } from "@/lib/db";

/**
 * Chamada do diário de classe.
 *
 * Antes isto vivia só no estado do navegador e sumia ao recarregar a página.
 * Agora cada dia de aula vira uma linha em `aulas` (única por turma + data) e
 * cada aluno uma linha em `presencas`.
 *
 * O padrão continua sendo falta: quem não foi marcado é gravado com
 * presente = false, o que distingue "faltou" de "não houve chamada".
 */

export interface PresencaSalva {
  alunoId: number;
  presente: boolean;
}

/** Garante a aula do dia e devolve o id. Idempotente por turma + data. */
async function garantirAula(turmaId: number, data: string): Promise<number> {
  const existente = await sql`
    SELECT id FROM aulas WHERE turma_id = ${turmaId} AND data_aula = ${data}::date
     LIMIT 1`;
  if (existente[0]) return existente[0].id as number;

  const criada = await sql`
    INSERT INTO aulas (turma_id, data_aula)
    VALUES (${turmaId}, ${data}::date)
    ON CONFLICT (turma_id, data_aula) DO UPDATE SET turma_id = EXCLUDED.turma_id
    RETURNING id`;
  return criada[0].id as number;
}

/**
 * Salva a chamada de uma turma num dia. Regravar o mesmo dia sobrescreve as
 * presenças em vez de duplicar — o professor pode corrigir depois.
 */
export async function salvarChamada(
  turmaId: number,
  data: string,
  presencas: PresencaSalva[],
  autorId: number,
): Promise<{ aulaId: number; registrados: number }> {
  const aulaId = await garantirAula(turmaId, data);

  for (const presenca of presencas) {
    await sql`
      INSERT INTO presencas (aula_id, aluno_id, presente, registrado_por)
      VALUES (${aulaId}, ${presenca.alunoId}, ${presenca.presente}, ${autorId})
      ON CONFLICT (aula_id, aluno_id)
      DO UPDATE SET presente = EXCLUDED.presente,
                    registrado_por = EXCLUDED.registrado_por`;
  }

  return { aulaId, registrados: presencas.length };
}

/** Chamada já gravada de uma turma num dia, para a tela abrir preenchida. */
export async function lerChamada(
  turmaId: number,
  data: string,
): Promise<Record<string, boolean>> {
  const linhas = await sql`
    SELECT pr.aluno_id, pr.presente
      FROM presencas pr
      JOIN aulas a ON a.id = pr.aula_id
     WHERE a.turma_id = ${turmaId} AND a.data_aula = ${data}::date`;

  const mapa: Record<string, boolean> = {};
  for (const linha of linhas as { aluno_id: number; presente: boolean }[]) {
    mapa[String(linha.aluno_id)] = linha.presente;
  }
  return mapa;
}
