"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useAcademia } from "@/lib/academiaStore";
import { CREDENCIAIS_DEMO, DESTINO_POR_PERFIL } from "@/services/dataService";

export default function LoginPage() {
  const router = useRouter();
  const { entrar } = useAcademia();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function preencher(credencial: (typeof CREDENCIAIS_DEMO)[number]) {
    setUsuario(credencial.usuario);
    setSenha(credencial.senha);
    setErro(null);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErro(null);

    // Simula a latência de uma chamada de autenticação real.
    window.setTimeout(() => {
      const resultado = entrar(usuario, senha);
      if (!resultado.ok || !resultado.sessao) {
        setErro(resultado.erro ?? "Não foi possível entrar.");
        setEnviando(false);
        return;
      }
      router.push(DESTINO_POR_PERFIL[resultado.sessao.perfil]);
    }, 400);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="section flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-2xs font-semibold text-white">
              松
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em] text-fg">
              Portal Shotokan
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

            <div className="mt-5 border-t border-line pt-4">
              <p className="label">Contas de teste</p>
              <div className="mt-2 space-y-1.5">
                {CREDENCIAIS_DEMO.map((credencial) => (
                  <button
                    key={credencial.perfil}
                    type="button"
                    onClick={() => preencher(credencial)}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-line bg-canvas px-3 py-2 text-left transition-colors hover:border-line-strong"
                  >
                    <span>
                      <span className="block text-xs font-medium text-fg">
                        {credencial.perfil}
                      </span>
                      <span className="block font-mono text-2xs text-muted">
                        {credencial.usuario} · {credencial.senha}
                      </span>
                    </span>
                    <span className="text-2xs font-medium text-accent">
                      Preencher
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-2xs leading-relaxed text-subtle">
                Alunos e professores cadastrados no portal entram com o usuário
                e a senha definidos no cadastro.
              </p>
            </div>
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
