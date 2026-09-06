import { NextResponse } from "next/server";
import { gravarCookieSessao } from "@/server/sessao";
import { autenticar } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login — { usuario, senha }
 *
 * Confere a senha (bcrypt) contra a tabela `users` e grava a sessão em um
 * cookie httpOnly assinado (HMAC-SHA256). O corpo devolvido serve só para a
 * interface saber quem entrou — quem manda nas rotas sensíveis é o cookie.
 */
export async function POST(request: Request) {
  let corpo: { usuario?: string; senha?: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (!corpo.usuario || !corpo.senha) {
    return NextResponse.json(
      { erro: "Informe usuário e senha." },
      { status: 400 },
    );
  }

  try {
    const conta = await autenticar(corpo.usuario, corpo.senha);
    if (!conta) {
      return NextResponse.json(
        { erro: "Usuário ou senha inválidos." },
        { status: 401 },
      );
    }

    await gravarCookieSessao({
      id: conta.id,
      nome: conta.nome,
      usuario: conta.usuario,
      perfil: conta.role,
    });

    return NextResponse.json({ conta });
  } catch (erro) {
    console.error("[auth/login]", erro);
    return NextResponse.json(
      { erro: "Falha ao entrar. Tente novamente." },
      { status: 500 },
    );
  }
}
