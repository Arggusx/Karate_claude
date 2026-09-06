import raw from "../../karate_shotokan_dados_completos.json";
import type {
  Admin,
  Aluno,
  Beneficio,
  CategoriaTecnica,
  Curiosidade,
  Depoimento,
  DicionarioItem,
  DojoKunItem,
  EtiquetaDojo,
  GraduacaoCompleta,
  KarateData,
  KataCompleto,
  KataResumo,
  Mestre,
  NivelKata,
  PerfilUsuario,
  Pilar,
  Professor,
  PrincipioTecnico,
  Tecnica,
  TimelineItem,
  Turma,
} from "@/types";

/**
 * Fonte única de verdade da aplicação: o JSON exportado do acervo
 * (`/karate_shotokan_dados_completos.json`). Este módulo apenas lê, tipa e
 * deriva estruturas de apresentação — nenhum conteúdo é reescrito aqui.
 */
export const dados = raw as unknown as KarateData;

// -------------------------------------------------------------- Constantes

/** Cores reais das faixas — idênticas nos temas claro e escuro. */
export const CORES_FAIXA: Record<string, string> = {
  branca: "#E5E7EB",
  amarela: "#FACC15",
  vermelha: "#DC2626",
  laranja: "#F97316",
  verde: "#22C55E",
  roxa: "#8B5CF6",
  marrom: "#92400E",
  preta: "#18181B",
};

/**
 * Agrupamento das três tabelas de katas, derivado dos campos `categoria` e
 * `nivelDificuldade` do JSON: os katas de grau Kyu (série Heian + Tekki
 * Shodan) formam os básicos, os "Especialista" formam os avançados e o
 * restante ocupa a faixa intermediária.
 */
function classificarNivel(kata: { categoria: string; nivelDificuldade: string }): NivelKata {
  if (kata.nivelDificuldade === "Especialista") return "avancado";
  if (
    (kata.categoria === "Heian" || kata.categoria === "Tekki") &&
    kata.nivelDificuldade !== "Avançado"
  ) {
    return "basico";
  }
  return "intermediario";
}

export const NIVEL_LABEL: Record<NivelKata, string> = {
  basico: "Katas Básicos / Iniciantes",
  intermediario: "Katas Intermediários",
  avancado: "Katas Avançados",
};

/**
 * Programa de exame por graduação. O JSON traz apenas o significado de cada
 * faixa (`graduacoes`), então os requisitos ficam nesta tabela local e são
 * combinados com o dado importado em `getGraduacoes()`.
 */
const PROGRAMA_EXAME: Record<
  string,
  { grau: string; tempoMinimo: string; katas: string[]; kihon: string[] }
> = {
  Branca: {
    grau: "7º Kyu",
    tempoMinimo: "3 meses de treino",
    katas: ["Taikyoku Shodan"],
    kihon: ["Zenkutsu-dachi", "Gedan Barai", "Oi-Zuki", "Mae-Geri"],
  },
  Amarela: {
    grau: "6º Kyu",
    tempoMinimo: "3 meses no 7º Kyu",
    katas: ["Heian Shodan"],
    kihon: ["Age-Uke", "Gyaku-Zuki", "Kokutsu-dachi", "Shuto-Uke"],
  },
  Vermelha: {
    grau: "5º Kyu",
    tempoMinimo: "4 meses no 6º Kyu",
    katas: ["Heian Nidan"],
    kihon: ["Uchi-Uke", "Yoko-Geri Keage", "Nukite", "Kizami-Zuki"],
  },
  Laranja: {
    grau: "4º Kyu",
    tempoMinimo: "4 meses no 5º Kyu",
    katas: ["Heian Sandan"],
    kihon: ["Kiba-dachi", "Soto-Uke", "Empi-Uchi", "Yoko-Geri Kekomi"],
  },
  Verde: {
    grau: "3º Kyu",
    tempoMinimo: "6 meses no 4º Kyu",
    katas: ["Heian Yondan"],
    kihon: ["Kakiwake-Uke", "Mawashi-Geri", "Hiza-Geri", "Mae-Geri + Empi"],
  },
  Roxa: {
    grau: "2º Kyu",
    tempoMinimo: "6 meses no 3º Kyu",
    katas: ["Heian Godan"],
    kihon: ["Manji-Uke", "Mikazuki-Geri", "Ushiro-Geri", "Jiyu Ippon Kumite"],
  },
  Marrom: {
    grau: "1º Kyu",
    tempoMinimo: "12 meses no 2º Kyu",
    katas: ["Tekki Shodan", "Bassai Dai"],
    kihon: ["Renzoku Waza", "Jiyu Kumite", "Todas as bases", "Combinações livres"],
  },
  Preta: {
    grau: "1º Dan +",
    tempoMinimo: "18 meses no 1º Kyu",
    katas: ["Kanku Dai", "Jion", "Empi", "Hangetsu"],
    kihon: ["Bunkai completo", "Jiyu Kumite", "Domínio de Kime e Zanshin"],
  },
};

// ---------------------------------------------------------------- Helpers

const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Extrai a cor real da faixa a partir de textos como "1º Kyu (Marrom)". */
export function corDaFaixa(texto: string): string {
  const alvo = normalizar(texto);
  const encontrada = Object.keys(CORES_FAIXA).find((cor) =>
    alvo.includes(normalizar(cor)),
  );
  return encontrada ? CORES_FAIXA[encontrada] : CORES_FAIXA.preta;
}

const RESUMO_POR_NOME = new Map<string, KataResumo>(
  dados.katasShotokan.map((kata) => [normalizar(kata.nome), kata]),
);

// ------------------------------------------------------------- Seletores

export function getPilares(): Pilar[] {
  return dados.pilares;
}

export function getTimeline(): TimelineItem[] {
  return dados.timeline;
}

export function getMestres(): Mestre[] {
  return dados.mestres;
}

export function getArvoreMestres(): string {
  return dados.textFiles.arvoreMestres;
}

export function getTabelaGenealogica(): string {
  return dados.textFiles.tabelaGenealogica;
}

export function getDojoKun(): DojoKunItem[] {
  return dados.dojoKun;
}

export function getNijuKun(): string[] {
  return dados.preceitosNijuKun;
}

export function getPreceitosFunakoshi(): string[] {
  return dados.preceitosFunakoshi;
}

export function getPrincipiosTecnicos(): PrincipioTecnico[] {
  return dados.principiosTecnicos;
}

export function getEtiquetaDojo(): EtiquetaDojo[] {
  return dados.etiquetaDojo;
}

export function getDicionario(): DicionarioItem[] {
  return dados.dicionario;
}

export function getBeneficios(): Beneficio[] {
  return dados.beneficios;
}

export function getDepoimentos(): Depoimento[] {
  return dados.depoimentos;
}

export function getCuriosidades(): Curiosidade[] {
  return dados.curiosidades;
}

export function getCategoriasTecnicas(): CategoriaTecnica[] {
  // A categoria "Katas" tem tela própria e não entra no filtro de kihon.
  return dados.categoriasTecnicas.filter((categoria) => categoria.id !== "Katas");
}

export function getTecnicas(): Tecnica[] {
  return dados.tecnicas;
}

export function getGraduacoes(): GraduacaoCompleta[] {
  return dados.graduacoes.map((graduacao) => {
    const programa = PROGRAMA_EXAME[graduacao.faixa];
    return {
      ...graduacao,
      id: normalizar(graduacao.faixa).replace(/\s+/g, "-"),
      grau: programa?.grau ?? "",
      cor: corDaFaixa(graduacao.faixa),
      tempoMinimo: programa?.tempoMinimo ?? "—",
      katasExigidos: programa?.katas ?? [],
      kihonExigido: programa?.kihon ?? [],
    };
  });
}

/**
 * Katas completos: cruza `katas26Detalhados` (ficha técnica, vídeo, embusen,
 * bunkai e movimentos) com `katasShotokan` (kanji e decomposição do nome).
 */
export function getKatas(): KataCompleto[] {
  return dados.katas26Detalhados.map((kata) => {
    const resumo = RESUMO_POR_NOME.get(normalizar(kata.nome));
    return {
      ...kata,
      nivel: classificarNivel(kata),
      kanji: resumo?.kanji ?? "",
      corFaixa: corDaFaixa(kata.faixaRecomendada),
      resumo,
    };
  });
}

export function getKatasPorNivel(nivel: NivelKata): KataCompleto[] {
  return getKatas().filter((kata) => kata.nivel === nivel);
}

export function getKataPorId(id: string): KataCompleto | undefined {
  return getKatas().find((kata) => kata.id === id);
}

/** Ordem sequencial usada pela navegação anterior / próximo. */
export function getKataVizinhos(id: string) {
  const katas = getKatas();
  const indice = katas.findIndex((kata) => kata.id === id);
  return {
    anterior: indice > 0 ? katas[indice - 1] : null,
    proximo:
      indice >= 0 && indice < katas.length - 1 ? katas[indice + 1] : null,
  };
}

/** Divide `tecnicasDestaque` ("Gedan Barai, Oi Zuki, ...") em itens. */
export function listarDestaques(kata: KataCompleto): string[] {
  return kata.tecnicasDestaque
    .split(/,|\s+e\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}


// ------------------------------------------- Dados da academia (portais)

/**
 * Alunos, professores e turmas NÃO moram mais aqui: vêm do banco (Neon) via
 * /api/academia. Este módulo guarda o acervo de karatê (JSON) e as constantes
 * de apresentação.
 */

/** Mensalidade em centavos. Configurável por env para testes de pagamento. */
export const MENSALIDADE_CENTAVOS = Number(
  process.env.NP_VALOR_MENSALIDADE_CENTAVOS ?? 1,
);

/** 5000 → "50,00"; 1 → "0,01" */
export function formatarReais(centavos: number): string {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

/**
 * A divisão real das turmas é por nível técnico e faixa, mas na prática o
 * critério mais usado no dojo é a idade — por isso ela abre cada turma.
 */
export const CRITERIO_TURMAS =
  "A divisão formal é por nível e faixa; na prática, a idade é o critério usado no dia a dia.";

/** Rota inicial de cada perfil depois do login. */
export const DESTINO_POR_PERFIL: Record<PerfilUsuario, string> = {
  aluno: "/portal/aluno",
  professor: "/portal/professor",
  admin: "/portal/admin",
};

/**
 * Normaliza um nome de usuário: minúsculas, sem acento e sem espaço. É essa
 * forma que garante a unicidade — "José Silva" e "jose.silva" colidem.
 */
export function normalizarUsuario(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9._-]+/g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/(^[.]|[.]$)/g, "");
}

/** Sugere "nome.sobrenome" a partir do nome completo. */
export function sugerirUsuario(nomeCompleto: string): string {
  const partes = nomeCompleto
    .replace(/^(Sensei|Senpai)\s+/i, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (partes.length === 0) return "";
  const primeiro = partes[0];
  const ultimo = partes.length > 1 ? partes[partes.length - 1] : "";
  return normalizarUsuario(ultimo ? `${primeiro}.${ultimo}` : primeiro);
}

/** Partículas que permanecem em minúsculas no meio do nome. */
const PARTICULAS = new Set([
  "de", "da", "do", "das", "dos", "e", "di", "du", "del",
  "van", "von", "der", "la", "le",
]);

/**
 * Padroniza o nome digitado: espaços extras removidos, cada palavra com a
 * inicial maiúscula e partículas ("da", "dos", "e") em minúsculas.
 */
export function formatarNome(nome: string): string {
  return nome
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .map((palavra, indice) => {
      if (indice > 0 && PARTICULAS.has(palavra)) return palavra;
      return palavra.replace(
        /(^|[-'’])([\p{L}])/gu,
        (_, separador: string, letra: string) =>
          separador + letra.toLocaleUpperCase("pt-BR"),
      );
    })
    .join(" ");
}

/** Formata o horário completo da turma: "Ter e Qui · 18:30 às 19:30". */
export function horarioDaTurma(turma: Turma): string {
  const dias = turma.dias.map((dia) => dia.slice(0, 3)).join(" e ");
  return `${dias} · ${turma.inicio} às ${turma.fim}`;
}

// --------------------------------------------- API assíncrona (client-side)

const delay = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchKatas(): Promise<KataCompleto[]> {
  await delay();
  return getKatas();
}

export async function fetchTecnicas(): Promise<Tecnica[]> {
  await delay();
  return getTecnicas();
}
