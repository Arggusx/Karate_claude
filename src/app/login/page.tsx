"use client";

import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useAcademia } from "@/lib/academiaStore";
import { DESTINO_POR_PERFIL } from "@/services/dataService";

export default function LoginPage() {
  const router = useRouter();
  const { entrar } = useAcademia();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErro(null);

    entrar(usuario, senha).then((resultado) => {
      if (!resultado.ok || !resultado.sessao) {
        setErro(resultado.erro ?? "Não foi possível entrar.");
        setEnviando(false);
        return;
      }
      router.push(DESTINO_POR_PERFIL[resultado.sessao.perfil]);
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="section flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MarcaTorakan className="h-10 w-10" />
            <span className="font-marca text-2xl leading-none text-accent">
              Torakan
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="card p-5">
            <h1 className="heading-lg">Área do Aluno / Professor</h1>
            <p className="body-muted mt-1">
              Entre com seu nome de usuário e senha.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-3">
              <div>
                <label htmlFor="usuario" className="label">
                  Nome de usuário
                </label>
                <input
                  id="usuario"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={usuario}
                  onChange={(event) => setUsuario(event.target.value)}
                  placeholder="nome.sobrenome"
                  className="input mt-1 font-mono"
                />
              </div>

              <div>
                <label htmlFor="senha" className="label">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="••••••••"
                  className="input mt-1"
                />
              </div>

              {erro ? (
                <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad">
                  {erro}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <p className="mt-4 border-t border-line pt-4 text-2xs leading-relaxed text-subtle">
              As contas são criadas pelo professor ou pelo admin no portal.
              Esqueceu a senha? Fale com a administração do dojo.
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            <Link href="/estudos" className="hover:text-fg">
              Continuar sem entrar — ir para o portal de estudos
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
