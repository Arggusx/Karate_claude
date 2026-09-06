import "server-only";
import { sql } from "@/lib/db";
import {
  FREQUENCIA_MINIMA,
  PESOS_PROGRESSO,
  aulasExigidas,
  graduacaoDaFaixa,
  mesesExigidos,
} from "@/services/dataService";

/**
 * Progresso para o próximo exame.
 *
 * Quatro critérios, cada um com seu próprio percentual, combinados por peso.
 * A barra única esconde o que falta; por isso a ficha mostra os quatro
 * separados e este módulo devolve todos.
 *
 *   técnica    40%  itens do programa validados pelo professor
 *   tempo      25%  meses na faixa atual sobre o mínimo da graduação
 *   aulas      25%  presenças desde a graduação sobre o esperado
 *   financeiro 10%  mensalidade em dia
 */

export interface CriterioProgresso {
  /** 0 a 100, já limitado. */
  percentual: number;
  /** Texto curto do que falta, para a interface não ter que recalcular. */
  detalhe: string;
}

export interface ProgressoAluno {
  alunoId: number;
  /** 0 a 100, média ponderada dos quatro critérios. */
  total: number;
  /** Percentual de presença no período, independente do peso. */
  frequencia: number;
  aptoParaExame: boolean;
  criterios: {
    tecnica: CriterioProgresso;
    tempo: CriterioProgresso;
    aulas: CriterioProgresso;
    financeiro: CriterioProgresso;
  };
}

interface LinhaAluno {
  aluno_id: number;
  faixa_atual: string;
  data_graduacao: string | null;
  status_mensalidade: string;
  presentes: number;
  realizadas: number;
  itens_concluidos: number;
}

const limitar = (valor: number) =>
  Math.max(0, Math.min(100, Math.round(valor)));

/** Meses completos entre a data e hoje. */
function mesesDesde(data: string | null): number {
  if (!data) return 0;
  const inicio = new Date(data);
  if (Number.isNaN(inicio.getTime())) return 0;

  const hoje = new Date();
  let meses =
    (hoje.getFullYear() - inicio.getFullYear()) * 12 +
    (hoje.getMonth() - inicio.getMonth());
  if (hoje.getDate() < inicio.getDate()) meses -= 1;

  return Math.max(0, meses);
}

function plural(n: number, singular: string, plural_: string) {
  return `${n} ${n === 1 ? singular : plural_}`;
}

/** Monta os quatro critérios a partir de uma linha já agregada pelo banco. */
function montar(linha: LinhaAluno): ProgressoAluno {
  const graduacao = graduacaoDaFaixa(linha.faixa_atual);

  // ------------------------------------------------------------- técnica
  const totalItens =
    (graduacao?.katasExigidos.length ?? 0) +
    (graduacao?.kihonExigido.length ?? 0);
  const concluidos = Math.min(linha.itens_concluidos, totalItens);
  const tecnica = totalItens > 0 ? (concluidos / totalItens) * 100 : 0;

  // --------------------------------------------------------------- tempo
  const mesesNaFaixa = mesesDesde(linha.data_graduacao);
  const mesesMinimos = mesesExigidos(graduacao?.tempoMinimo ?? "");
  const tempo = mesesMinimos > 0 ? (mesesNaFaixa / mesesMinimos) * 100 : 0;

  // --------------------------------------------------------------- aulas
  const esperadas = aulasExigidas(graduacao?.tempoMinimo ?? "");
  const aulas = esperadas > 0 ? (linha.presentes / esperadas) * 100 : 0;

  // A frequência é outra conta: presenças sobre aulas que de fato aconteceram.
  const frequencia =
    linha.realizadas > 0 ? (linha.presentes / linha.realizadas) * 100 : 0;

  // ---------------------------------------------------------- financeiro
  const emDia = linha.status_mensalidade === "ativo";

  const criterios = {
    tecnica: {
      percentual: limitar(tecnica),
      detalhe:
        totalItens === 0
          ? "Programa da faixa não mapeado"
          : `${concluidos} de ${totalItens} itens validados`,
    },
    tempo: {
      percentual: limitar(tempo),
      detalhe:
        mesesMinimos === 0
          ? "Sem tempo mínimo definido"
          : `${plural(mesesNaFaixa, "mês", "meses")} de ${mesesMinimos} na faixa`,
    },
    aulas: {
      percentual: limitar(aulas),
      detalhe:
        esperadas === 0
          ? "Sem mínimo de aulas definido"
          : `${linha.presentes} de ${esperadas} presenças`,
    },
    financeiro: {
      percentual: emDia ? 100 : 0,
      detalhe: emDia ? "Mensalidade em dia" : "Mensalidade pendente",
    },
  };

  const total =
    criterios.tecnica.percentual * PESOS_PROGRESSO.tecnica +
    criterios.tempo.percentual * PESOS_PROGRESSO.tempo +
    criterios.aulas.percentual * PESOS_PROGRESSO.aulas +
    criterios.financeiro.percentual * PESOS_PROGRESSO.financeiro;

  return {
    alunoId: linha.aluno_id,
    total: limitar(total),
    frequencia: limitar(frequencia),
    // Apto exige os quatro critérios cheios E a frequência acima do piso —
    // um aluno pode bater o número de presenças e ainda faltar demais.
    aptoParaExame:
      criterios.tecnica.percentual >= 100 &&
      criterios.tempo.percentual >= 100 &&
      criterios.aulas.percentual >= 100 &&
      emDia &&
      limitar(frequencia) >= FREQUENCIA_MINIMA,
    criterios,
  };
}

/**
 * Progresso de todos os alunos ativos, numa consulta só.
 *
 * As presenças e as aulas realizadas contam apenas a partir da data de
 * graduação: o ciclo é o da faixa atual, não a vida inteira do aluno.
 */
export async function calcularProgresso(): Promise<
  Map<number, ProgressoAluno>
> {
  const linhas = (await sql`
    SELECT p.user_id AS aluno_id,
           p.faixa_atual,
           p.data_graduacao::text AS data_graduacao,
           p.status_mensalidade,
           COALESCE(f.presentes, 0)::int  AS presentes,
           COALESCE(f.realizadas, 0)::int AS realizadas,
           COALESCE(t.itens, 0)::int      AS itens_concluidos
      FROM alunos_perfil p
      JOIN users u ON u.id = p.user_id AND u.ativo = true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) FILTER (WHERE pr.presente) AS presentes,
               COUNT(*)                            AS realizadas
          FROM presencas pr
          JOIN aulas a ON a.id = pr.aula_id
         WHERE pr.aluno_id = p.user_id
           AND (p.data_graduacao IS NULL OR a.data_aula >= p.data_graduacao)
      ) f ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS itens
          FROM programa_concluido pc
         WHERE pc.aluno_id = p.user_id
           AND pc.faixa_alvo = p.faixa_atual
      ) t ON true`) as LinhaAluno[];

  return new Map(linhas.map((linha) => [linha.aluno_id, montar(linha)]));
}

/** Itens do programa já validados para a faixa atual do aluno. */
export async function listarProgramaConcluido(
  alunoId: number,
): Promise<{ tipo: string; item: string }[]> {
  const linhas = await sql`
    SELECT pc.tipo, pc.item
      FROM programa_concluido pc
      JOIN alunos_perfil p ON p.user_id = pc.aluno_id
     WHERE pc.aluno_id = ${alunoId}
       AND pc.faixa_alvo = p.faixa_atual`;
  return linhas as { tipo: string; item: string }[];
}

/** Marca ou desmarca um item do programa da faixa atual. */
export async function definirItemPrograma(
  alunoId: number,
  dados: {
    tipo: "kata" | "kihon";
    item: string;
    concluido: boolean;
    autorId: number;
  },
): Promise<void> {
  const perfil = await sql`
    SELECT faixa_atual FROM alunos_perfil WHERE user_id = ${alunoId} LIMIT 1`;
  const faixa = perfil[0]?.faixa_atual as string | undefined;
  if (!faixa) throw new Error("Aluno sem perfil.");

  if (dados.concluido) {
    await sql`
      INSERT INTO programa_concluido (aluno_id, faixa_alvo, tipo, item, autor_id)
      VALUES (${alunoId}, ${faixa}, ${dados.tipo}, ${dados.item}, ${dados.autorId})
      ON CONFLICT (aluno_id, faixa_alvo, tipo, item) DO NOTHING`;
  } else {
    await sql`
      DELETE FROM programa_concluido
       WHERE aluno_id = ${alunoId} AND faixa_alvo = ${faixa}
         AND tipo = ${dados.tipo} AND item = ${dados.item}`;
  }
}

/** Grava a graduação do aluno: nova faixa e a data em que ela começa a contar. */
export async function registrarGraduacao(
  alunoId: number,
  faixa: string,
  data: string,
): Promise<void> {
  await sql`
    UPDATE alunos_perfil
       SET faixa_atual = ${faixa},
           data_graduacao = ${data}::date,
           atualizado_em = CURRENT_TIMESTAMP
     WHERE user_id = ${alunoId}`;
}
