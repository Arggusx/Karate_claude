import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import { criarProfessor, usuarioEmUso } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/academia/professores — exclusivo do admin (sessão assinada). */
export async function POST(request: Request) {
  let corpo: {
    nome?: string;
    usuario?: string;
    senha?: string;
    email?: string;
  };

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (!corpo.nome?.trim()) {
    return NextResponse.json({ erro: "Informe o nome." }, { status: 400 });
  }
  if (!corpo.usuario || !corpo.senha || corpo.senha.length < 6) {
    return NextResponse.json(
      { erro: "Usuário e senha (mínimo 6 caracteres) são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    await exigirPerfil(["admin"]);

    if (await usuarioEmUso(corpo.usuario)) {
      return NextResponse.json(
        { erro: `O usuário "${corpo.usuario}" já está em uso.` },
        { status: 409 },
      );
    }

    const { id } = await criarProfessor({
      nome: corpo.nome.trim(),
      usuario: corpo.usuario,
      senha: corpo.senha,
      email: corpo.email?.trim() || `${corpo.usuario}@shotokan.local`,
    });

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[academia/professores]", erro);
    return NextResponse.json(
      { erro: "Falha ao cadastrar o professor." },
      { status: 500 },
    );
  }
}
