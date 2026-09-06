/**
 * Tipagens espelhando a estrutura de `karate_shotokan_dados_completos.json`
 * (raiz do repositório). Os nomes de campo são idênticos aos do arquivo.
 */

export interface NavegacaoItem {
  id: string;
  label: string;
  kanji: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  kanjiTranslate: string;
  kanji: string;
  text: string;
  detail: string;
}

export interface DojoKunItem {
  jp: string;
  romaji: string;
  pt: string;
  text: string;
}

export interface Mestre {
  nome: string;
  kanji: string;
  anos: string;
  text: string;
}

export interface KataDecomposicao {
  termo: string;
  significado: string;
}

/** Entrada resumida da lista `katasShotokan`. */
export interface KataResumo {
  nome: string;
  kanji: string;
  nivel: string;
  mov: number;
  categoria: string;
  significado: string;
  decomposicao: KataDecomposicao[];
  text: string;
  videoUrl: string;
  enbusenUrl: string;
  imagemUrl: string;
}

/** Entrada completa da lista `katas26Detalhados`. */
export interface KataDetalhado {
  id: string;
  nome: string;
  categoria: string;
  faixaRecomendada: string;
  quantidadeMovimentos: number;
  posicoesKiai: string;
  significadoNome: string;
  tecnicasDestaque: string;
  nivelDificuldade: string;
  videoUrl: string;
  embusenOficialImg: string;
  embusenCompletoImg: string;
  bunkai: string[];
  movimentos: string[];
}

export interface Graduacao {
  faixa: string;
  jp: string;
  txt: string;
}

export interface Pilar {
  kanji: string;
  nome: string;
  pt: string;
  tagline: string;
  oque_e: string;
  para_que_serve: string;
}

export interface EtiquetaDetalhe {
  titulo: string;
  desc: string;
}

export interface EtiquetaDojo {
  kanji: string;
  nome: string;
  romaji: string;
  traducao: string;
  oque_e: string;
  para_que_serve: string;
  detalhes?: EtiquetaDetalhe[];
}

export interface PrincipioTecnico {
  k: string;
  n: string;
  traducao: string;
  oque_e: string;
  para_que_serve: string;
}

export interface DicionarioItem {
  jp: string;
  romaji: string;
  pt: string;
}

export interface Beneficio {
  kanji: string;
  titulo: string;
  text: string;
}

export interface Depoimento {
  nome: string;
  antes: string;
  depois: string;
}

export interface CategoriaTecnica {
  id: string;
  label: string;
  kanji: string;
}

export interface Tecnica {
  tipo: string;
  cat: string;
  nome: string;
  kanji: string;
  pt: string;
  desc: string;
}

export interface Curiosidade {
  titulo: string;
  text: string;
}

export interface TextFiles {
  dataKatas: string;
  arvoreMestres: string;
  katasVideo: string;
  tabelaGenealogica: string;
}

export interface KarateData {
  projeto: string;
  exportadoEm: string;
  navegacao: NavegacaoItem[];
  timeline: TimelineItem[];
  dojoKun: DojoKunItem[];
  mestres: Mestre[];
  preceitosNijuKun: string[];
  katasShotokan: KataResumo[];
  graduacoes: Graduacao[];
  pilares: Pilar[];
  etiquetaDojo: EtiquetaDojo[];
  principiosTecnicos: PrincipioTecnico[];
  dicionario: DicionarioItem[];
  beneficios: Beneficio[];
  depoimentos: Depoimento[];
  categoriasTecnicas: CategoriaTecnica[];
  tecnicas: Tecnica[];
  curiosidades: Curiosidade[];
  preceitosFunakoshi: string[];
  katas26Detalhados: KataDetalhado[];
  textFiles: TextFiles;
}

// ------------------------------------------------ Tipos derivados da view

export type NivelKata = "basico" | "intermediario" | "avancado";

/** Kata detalhado enriquecido com os campos do resumo (kanji, decomposição). */
export interface KataCompleto extends KataDetalhado {
  nivel: NivelKata;
  kanji: string;
  corFaixa: string;
  resumo?: KataResumo;
}

/** Graduação enriquecida com cor da faixa e programa de exame. */
export interface GraduacaoCompleta extends Graduacao {
  id: string;
  grau: string;
  cor: string;
  tempoMinimo: string;
  katasExigidos: string[];
  kihonExigido: string[];
}

// ------------------------------------------- Domínio da academia (portais)

export type StatusPagamento = "ativo" | "pendente" | "atrasado";

export type PerfilUsuario = "aluno" | "professor" | "admin";

/** Plano de uma aula dentro da semana da turma. */
export interface AulaPlano {
  dia: string;
  foco: string;
  conteudo: string[];
}

export interface Turma {
  id: string;
  nome: string;
  faixaEtaria: string;
  dias: string[];
  inicio: string;
  fim: string;
  faixasTipicas: string;
  professorId: string;
  plano: AulaPlano[];
}

export interface Professor {
  id: string;
  nome: string;
  usuario: string;
  senha: string;
  /** "AAAA-MM-DD"; vazio quando não informada. */
  dataNascimento: string;
  idade: number | null;
  graduacao: string;
  email: string;
  desde: string;
  foto: string;
}

/** Um dos quatro critérios que compõem o progresso para o exame. */
export interface CriterioProgresso {
  percentual: number;
  detalhe: string;
}

export interface CriteriosProgresso {
  tecnica: CriterioProgresso;
  tempo: CriterioProgresso;
  aulas: CriterioProgresso;
  financeiro: CriterioProgresso;
}

export interface Aluno {
  id: string;
  nome: string;
  usuario: string;
  senha: string;
  /** "AAAA-MM-DD"; vazio quando não informada. */
  dataNascimento: string;
  idade: number;
  turmaId: string;
  faixa: string;
  corFaixa: string;
  progresso: number;
  proximoExame: string;
  status: StatusPagamento;
  foto: string;
  frequencia: number;
  aptoParaExame: boolean;
  /** Null enquanto a API não respondeu. */
  criterios: CriteriosProgresso | null;
}

/** Presença padrão da chamada é falta: só entra aqui quem for marcado. */
export type Chamada = Record<string, boolean>;

/** Conta administrativa — não está vinculada a aluno nem a professor. */
export interface Admin {
  id: string;
  nome: string;
  usuario: string;
  senha: string;
  foto: string;
}

/** Sessão ativa no navegador. */
export interface Sessao {
  perfil: PerfilUsuario;
  id: string;
  nome: string;
  usuario: string;
}
