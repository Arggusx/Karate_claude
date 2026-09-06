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
    SELECT u.id, u.nome, u.usuario, u.email, u.idade,
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
}

export async function listarProfessores(): Promise<ProfessorDoBanco[]> {
  const linhas = await sql`
    SELECT id, nome, usuario, email, role, criado_em
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
  turmaId: number | null;
  faixa: string;
}): Promise<{ id: number }> {
  const usuario = normalizarUsuario(dados.usuario);

  const linhas = await sql`
    INSERT INTO users (nome, email, senha_hash, role, usuario, idade,
                       ativo, precisa_trocar_senha, financial_status)
    VALUES (${dados.nome}, ${dados.email}, ${gerarHashSenha(dados.senha)},
            'aluno', ${usuario}, ${dados.idade}, true, true, 'pendente')
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
  role?: "professor" | "admin";
}): Promise<{ id: number }> {
  const linhas = await sql`
    INSERT INTO users (nome, email, senha_hash, role, usuario,
                       ativo, precisa_trocar_senha)
    VALUES (${dados.nome}, ${dados.email}, ${gerarHashSenha(dados.senha)},
            ${dados.role ?? "professor"}, ${normalizarUsuario(dados.usuario)},
            true, true)
    RETURNING id`;
  return { id: linhas[0].id as number };
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
