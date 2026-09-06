"use client";

import { useState } from "react";
import {
  CampoUsuario,
  type StatusUsuario,
} from "@/components/portal/CampoUsuario";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAcademia } from "@/lib/academiaStore";
import {
  CORES_FAIXA,
  formatarNome,
  getGraduacoes,
  normalizarUsuario,
} from "@/services/dataService";

const GRADUACOES = getGraduacoes();

export function CadastroAlunoPanel() {
  const { turmas, criarAluno } = useAcademia();
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [idade, setIdade] = useState("");
  const [turmaId, setTurmaId] = useState(turmas[0]?.id ?? "");
  const [faixaId, setFaixaId] = useState(GRADUACOES[0]?.id ?? "");
  const [statusUsuario, setStatusUsuario] = useState<StatusUsuario>("vazio");
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<string | null>(null);

  async function cadastrar(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("Informe o nome completo do aluno.");
      return;
    }

    const graduacao = GRADUACOES.find((item) => item.id === faixaId);

    const resultado = await criarAluno({
      nome: formatarNome(nome),
      usuario,
      senha,
      idade: Number(idade) || 0,
      turmaId: turmaId || turmas[0]?.id || "",
      faixa: `${graduacao?.faixa ?? "Branca"} · ${graduacao?.grau ?? "7º Kyu"}`,
      corFaixa: graduacao?.cor ?? CORES_FAIXA.branca,
      progresso: 0,
      proximoExame: "A definir",
      status: "ativo",
      frequencia: 100,
    });

    if (!resultado.ok) {
      setErro(resultado.erro ?? "Não foi possível cadastrar.");
      return;
    }

    setConfirmado(`${formatarNome(nome)}|${normalizarUsuario(usuario)}`);
    setNome("");
    setUsuario("");
    setSenha("");
    setIdade("");
    setStatusUsuario("vazio");
  }

  const usuarioValido = statusUsuario === "livre";
  const [nomeConfirmado, usuarioConfirmado] = (confirmado ?? "").split("|");

  return (
    <>
      <section className="card max-w-2xl">
        <div className="border-b border-line px-4 py-2.5">
          <h2 className="heading-md">Cadastrar novo aluno</h2>
          <p className="mt-0.5 text-xs text-muted">
            O usuário e a senha definidos aqui são as credenciais de acesso ao
            portal.
          </p>
        </div>

        <form onSubmit={cadastrar} className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="aluno-nome" className="label">
              Nome completo
            </label>
            <input
              id="aluno-nome"
              className="input mt-1"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              onBlur={() => setNome(formatarNome(nome))}
              placeholder="Nome do aluno"
            />
          </div>

          <CampoUsuario
            id="aluno-usuario"
            nomeCompleto={nome}
            valor={usuario}
            onChange={setUsuario}
            onStatus={setStatusUsuario}
          />

          <div>
            <label htmlFor="aluno-senha" className="label">
              Senha de acesso
            </label>
            <input
              id="aluno-senha"
              type="text"
              className="input mt-1"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
            <p className="mt-1 text-2xs text-subtle">
              Combine a senha com o aluno ou o responsável.
            </p>
          </div>

          <div>
            <label htmlFor="aluno-idade" className="label">
              Idade
            </label>
            <input
              id="aluno-idade"
              type="number"
              className="input mt-1"
              value={idade}
              onChange={(event) => setIdade(event.target.value)}
              placeholder="10"
            />
          </div>

          <div>
            <label htmlFor="aluno-contato" className="label">
              Telefone do responsável
            </label>
            <input
              id="aluno-contato"
              name="contato"
              className="input mt-1"
              placeholder="(11) 90000-0000"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="aluno-email" className="label">
              E-mail do aluno ou responsável
            </label>
            <input
              id="aluno-email"
              name="email"
              type="email"
              className="input mt-1"
              placeholder="responsavel@email.com"
            />
            <p className="mt-1 text-2xs text-subtle">
              Não é usado para entrar — serve para contato e, futuramente, para
              o envio dos comprovantes de pagamento.
            </p>
          </div>

          <div>
            <label htmlFor="aluno-turma" className="label">
              Turma
            </label>
            <select
              id="aluno-turma"
              className="input mt-1"
              value={turmaId}
              onChange={(event) => setTurmaId(event.target.value)}
            >
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome} · {turma.faixaEtaria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="aluno-faixa" className="label">
              Faixa inicial
            </label>
            <select
              id="aluno-faixa"
              className="input mt-1"
              value={faixaId}
              onChange={(event) => setFaixaId(event.target.value)}
            >
              {GRADUACOES.map((graduacao) => (
                <option key={graduacao.id} value={graduacao.id}>
                  {graduacao.faixa} · {graduacao.grau}
                </option>
              ))}
            </select>
          </div>

          {erro ? (
            <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad sm:col-span-2">
              {erro}
            </p>
          ) : null}

          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" size="sm" disabled={!usuarioValido}>
              Cadastrar aluno
            </Button>
            {statusUsuario === "ocupado" ? (
              <span className="text-2xs text-status-bad">
                Escolha um nome de usuário livre para continuar.
              </span>
            ) : null}
          </div>
        </form>
      </section>

      <Modal
        open={confirmado !== null}
        onClose={() => setConfirmado(null)}
        titulo="Aluno cadastrado"
      >
        <p className="text-sm text-muted">
          {nomeConfirmado} foi matriculado e já pode entrar no portal com o
          usuário{" "}
          <span className="font-mono font-medium text-fg">
            {usuarioConfirmado}
          </span>
          .
        </p>
        <Button size="sm" className="mt-4" onClick={() => setConfirmado(null)}>
          Fechar
        </Button>
      </Modal>
    </>
  );
}
