import "server-only";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

/**
 * Contas de acesso (alunos, professores e admin) e leitura das turmas.
 * Substitui o estado que vivia no localStorage do navegador.
 *
 * Senhas nunca são guardadas em texto — bcrypt, o mesmo formato das contas
 * que já existiam no banco.
 */

export type Perfil = "aluno" | "professor" | "admin";

export interface ContaBasica {
  id: number;
  nome: string;
  usuario: string;
  role: Perfil;
  ativo: boolean;
  precisa_trocar_senha: boolean;
}

// ------------------------------------------------------------------- senha

export function gerarHashSenha(senha: string): string {
  return bcrypt.hashSync(senha, 12);
}

export function conferirSenha(senha: string, guardado: string): boolean {
  try {
    return bcrypt.compareSync(senha, guardado);
  } catch {
    return false;
  }
}

/**
 * Normaliza o nome de usuário: minúsculas, sem acento e sem espaço.
 * Mesma regra do front-end — é a forma que garante unicidade.
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

// --------------------------------------------------------------- consultas

export async function autenticar(
  usuarioInformado: string,
  senha: string,
): Promise<ContaBasica | null> {
  const usuario = normalizarUsuario(usuarioInformado);
  if (!usuario) return null;

  const linhas = await sql`
    SELECT id, nome, usuario, role, ativo, precisa_trocar_senha, senha_hash
      FROM users
     WHERE usuario = ${usuario} AND ativo = true
     LIMIT 1`;

  const conta = linhas[0] as (ContaBasica & { senha_hash: string }) | undefined;
  if (!conta) return null;
  if (!conferirSenha(senha, conta.senha_hash)) return null;

  const { senha_hash: _ignorado, ...publico } = conta;
  return publico;
}

export async function usuarioEmUso(usuario: string): Promise<boolean> {
  const linhas = await sql`
    SELECT 1 FROM users WHERE usuario = ${normalizarUsuario(usuario)} LIMIT 1`;
  return linhas.length > 0;
}

export interface AlunoDoBanco {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  data_nascimento: string | null;
  idade: number | null;
  turma_id: number | null;
  faixa_atual: string;
  progresso: number;
  frequencia: number;
  proximo_exame: string | null;
  financial_status: string;
}

export async function listarAlunos(): Promise<AlunoDoBanco[]> {
  const linhas = await sql`
    SELECT u.id, u.nome, u.usuario, u.email,
           u.data_nascimento::text AS data_nascimento,
           -- A data de nascimento manda. Idade solta é o fallback de quem foi
           -- cadastrado antes de o campo passar a ser preenchido.
           COALESCE(
             EXTRACT(YEAR FROM age(u.data_nascimento))::int,
             u.idade
           ) AS idade,
           p.turma_id, p.faixa_atual,
           p.progresso, p.frequencia, p.proximo_exame,
           u.financial_status
      FROM users u
      JOIN alunos_perfil p ON p.user_id = u.id
     WHERE u.ativo = true
     ORDER BY u.nome`;
  return linhas as AlunoDoBanco[];
}

export interface ProfessorDoBanco {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  role: Perfil;
  criado_em: string;
  data_nascimento: string | null;
  idade: number | null;
}

export async function listarProfessores(): Promise<ProfessorDoBanco[]> {
  const linhas = await sql`
    SELECT id, nome, usuario, email, role, criado_em,
           data_nascimento::text AS data_nascimento,
           COALESCE(
             EXTRACT(YEAR FROM age(data_nascimento))::int,
             idade
           ) AS idade
      FROM users
     WHERE role IN ('professor', 'admin') AND ativo = true
     ORDER BY nome`;
  return linhas as ProfessorDoBanco[];
}

export interface TurmaDoBanco {
  id: number;
  nome: string;
  dias_semana: string;
  horario: string;
  hora_fim: string | null;
  faixa_etaria: string | null;
  faixas_tipicas: string | null;
  professor_id: number | null;
  plano: { dia: string; foco: string; conteudo: string[] }[];
}

export async function listarTurmas(): Promise<TurmaDoBanco[]> {
  const linhas = await sql`
    SELECT id, nome, dias_semana, horario::text, hora_fim::text,
           faixa_etaria, faixas_tipicas, professor_id, plano
      FROM turmas
     WHERE ativa = true
     ORDER BY horario`;
  return linhas as TurmaDoBanco[];
}

// --------------------------------------------------------------- comandos

export async function criarAluno(dados: {
  nome: string;
  usuario: string;
  senha: string;
  email: string;
  idade: number | null;
  dataNascimento: string | null;
  turmaId: number | null;
  faixa: string;
}): Promise<{ id: number }> {
  const usuario = normalizarUsuario(dados.usuario);

  const linhas = await sql`
    INSERT INTO users (nome, email, senha_hash, role, usuario, idade,
                       data_nascimento, ativo, precisa_trocar_senha,
                       financial_status)
    VALUES (${dados.nome}, ${dados.email}, ${gerarHashSenha(dados.senha)},
            'aluno', ${usuario}, ${dados.idade},
            ${dados.dataNascimento}::date, true, true, 'pendente')
    RETURNING id`;

  const id = linhas[0].id as number;

  await sql`
    INSERT INTO alunos_perfil (user_id, turma_id, faixa_atual, status_mensalidade)
    VALUES (${id}, ${dados.turmaId}, ${dados.faixa}, 'pendente')
    ON CONFLICT (user_id) DO UPDATE
      SET turma_id = EXCLUDED.turma_id, faixa_atual = EXCLUDED.faixa_atual`;

  return { id };
}

export async function criarProfessor(dados: {
  nome: string;
  usuario: string;
  senha: string;
  email: string;
  dataNascimento?: string | null;
  role?: "professor" | "admin";
}): Promise<{ id: number }> {
  const linhas = await sql`
    INSERT INTO users (nome, email, senha_hash, role, usuario,
                       data_nascimento, ativo, precisa_trocar_senha)
    VALUES (${dados.nome}, ${dados.email}, ${gerarHashSenha(dados.senha)},
            ${dados.role ?? "professor"}, ${normalizarUsuario(dados.usuario)},
            ${dados.dataNascimento ?? null}::date, true, true)
    RETURNING id`;
  return { id: linhas[0].id as number };
}

export async function buscarConta(id: number): Promise<ContaBasica | null> {
  const linhas = await sql`
    SELECT id, nome, usuario, role, ativo, precisa_trocar_senha
      FROM users WHERE id = ${id} LIMIT 1`;
  return (linhas[0] as ContaBasica) ?? null;
}

/**
 * Desmatricula desativando a conta, sem apagar a linha.
 *
 * Mensalidades, lançamentos financeiros e chamadas apontam para users.id — uma
 * exclusão física levaria junto o histórico que precisa continuar auditável, e
 * o registro de quem já pagou não pode sumir. Todas as listagens dos portais
 * filtram por ativo = true, então a conta desaparece das telas do mesmo jeito.
 */
export async function desativarConta(id: number): Promise<ContaBasica | null> {
  const linhas = await sql`
    UPDATE users SET ativo = false
     WHERE id = ${id} AND ativo = true
    RETURNING id, nome, usuario, role, ativo, precisa_trocar_senha`;

  const conta = linhas[0] as ContaBasica | undefined;
  if (!conta) return null;

  // Turma órfã é melhor do que turma apontando para conta desativada: o admin
  // reatribui pela tela de turmas.
  await sql`UPDATE turmas SET professor_id = NULL WHERE professor_id = ${id}`;

  return conta;
}

/**
 * Edita os dados do aluno que a equipe pode mudar depois do cadastro.
 * Campo ausente fica como está — COALESCE com o parâmetro nulo.
 */
export async function atualizarAluno(
  alunoId: number,
  mudancas: { faixa?: string; dataNascimento?: string | null },
): Promise<void> {
  if (mudancas.dataNascimento !== undefined) {
    await sql`
      UPDATE users
         SET data_nascimento = ${mudancas.dataNascimento}::date
       WHERE id = ${alunoId}`;
  }

  if (mudancas.faixa !== undefined) {
    // Trocar de faixa é graduar: o ciclo de tempo mínimo e de aulas recomeça
    // hoje. Regravar a mesma faixa não mexe na data — só uma correção de texto.
    await sql`
      UPDATE alunos_perfil
         SET faixa_atual = ${mudancas.faixa},
             data_graduacao = CASE
               WHEN faixa_atual IS DISTINCT FROM ${mudancas.faixa}
                 THEN CURRENT_DATE
               ELSE data_graduacao
             END,
             atualizado_em = CURRENT_TIMESTAMP
       WHERE user_id = ${alunoId}`;
  }
}

export async function moverAlunoDeTurma(
  alunoId: number,
  turmaId: number,
): Promise<void> {
  await sql`
    UPDATE alunos_perfil
       SET turma_id = ${turmaId}, atualizado_em = CURRENT_TIMESTAMP
     WHERE user_id = ${alunoId}`;
}
