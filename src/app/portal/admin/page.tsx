"use client";

import { useState, type FormEvent } from "react";
import { CadastroAlunoPanel } from "@/components/portal/CadastroAlunoPanel";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { CampoUsuario } from "@/components/portal/CampoUsuario";
import { DiarioPanel } from "@/components/portal/DiarioPanel";
import { ResumoAcademia } from "@/components/portal/ResumoAcademia";
import { TurmasPanel } from "@/components/portal/TurmasPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/Tabs";
import { useAcademia } from "@/lib/academiaStore";
import {
  formatarNome,
  horarioDaTurma,
  normalizarUsuario,
} from "@/services/dataService";

type Aba = "turmas" | "diario" | "professores" | "cadastro";

const ABAS = [
  { value: "turmas" as const, label: "Turmas" },
  { value: "diario" as const, label: "Diário de classe" },
  { value: "professores" as const, label: "Professores" },
  { value: "cadastro" as const, label: "Cadastro" },
];

export default function PortalAdminPage() {
  return (
    <GuardaPortal perfis={["admin"]}>
      <ConteudoAdmin />
    </GuardaPortal>
  );
}

function ConteudoAdmin() {
  const [aba, setAba] = useState<Aba>("turmas");

  return (
    <div className="section space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <div>
          <p className="eyebrow">Portal do Admin</p>
          <h1 className="heading-lg mt-1">Administração do dojo</h1>
          <p className="mt-1 text-xs text-muted">
            Tudo que o professor vê, mais o cadastro de professores e a
            distribuição de turmas entre eles.
          </p>
        </div>
        <Badge tone="accent">Acesso total</Badge>
      </header>

      <ResumoAcademia comFinanceiro />

      <SegmentedControl options={ABAS} value={aba} onChange={setAba} />

      {aba === "turmas" ? (
        <TurmasPanel />
      ) : aba === "diario" ? (
        <DiarioPanel />
      ) : aba === "professores" ? (
        <ProfessoresPanel />
      ) : (
        <CadastroAlunoPanel />
      )}
    </div>
  );
}

/** Exclusivo do admin: cadastro de professores e suas turmas. */
function ProfessoresPanel() {
  const { professores, turmas, alunosDaTurma, criarProfessor } = useAcademia();
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [graduacao, setGraduacao] = useState("");
  const [email, setEmail] = useState("");
  const [desde, setDesde] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<string | null>(null);

  function cadastrar(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("Informe o nome completo do professor.");
      return;
    }

    const resultado = criarProfessor({
      nome: formatarNome(nome),
      usuario,
      senha,
      graduacao: graduacao.trim() || "1º Dan",
      email: email.trim(),
      desde: desde.trim() || String(new Date().getFullYear()),
    });

    if (!resultado.ok) {
      setErro(resultado.erro ?? "Não foi possível cadastrar.");
      return;
    }

    setConfirmado(`${formatarNome(nome)}|${normalizarUsuario(usuario)}`);
    setNome("");
    setUsuario("");
    setSenha("");
    setGraduacao("");
    setEmail("");
    setDesde("");
  }

  const [nomeConfirmado, usuarioConfirmado] = (confirmado ?? "").split("|");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        {professores.map((professor) => {
          const doProfessor = turmas.filter(
            (turma) => turma.professorId === professor.id,
          );
          const totalAlunos = doProfessor.reduce(
            (total, turma) => total + alunosDaTurma(turma.id).length,
            0,
          );

          return (
            <article key={professor.id} className="card">
              <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded border border-line bg-elevated text-xs font-medium text-fg">
                    {professor.foto}
                  </span>
                  <div>
                    <h3 className="heading-md">{professor.nome}</h3>
                    <p className="text-2xs text-muted">{professor.email}</p>
                  </div>
                </div>
                <Badge tone="accent">{professor.graduacao}</Badge>
              </div>

              <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
                <div className="px-4 py-2.5">
                  <p className="label">No dojo desde</p>
                  <p className="mt-0.5 text-sm font-semibold text-fg">
                    {professor.desde}
                  </p>
                </div>
                <div className="px-4 py-2.5">
                  <p className="label">Turmas</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-fg">
                    {doProfessor.length}
                  </p>
                </div>
                <div className="px-4 py-2.5">
                  <p className="label">Alunos</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-fg">
                    {totalAlunos}
                  </p>
                </div>
              </div>

              {doProfessor.length === 0 ? (
                <p className="px-4 py-3 text-xs text-subtle">
                  Nenhuma turma atribuída.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {doProfessor.map((turma) => (
                    <li
                      key={turma.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5"
                    >
                      <span>
                        <span className="block text-xs font-medium text-fg">
                          Turma {turma.nome}
                        </span>
                        <span className="block text-2xs text-muted">
                          {horarioDaTurma(turma)} · {turma.faixaEtaria}
                        </span>
                      </span>
                      <span className="text-2xs tabular-nums text-subtle">
                        {alunosDaTurma(turma.id).length} alunos
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>

      <section className="card max-w-2xl">
        <div className="border-b border-line px-4 py-2.5">
          <h2 className="heading-md">Cadastrar professor</h2>
          <p className="mt-0.5 text-xs text-muted">
            Somente o admin pode criar contas de professor.
          </p>
        </div>

        <form onSubmit={cadastrar} className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="prof-nome" className="label">
              Nome completo
            </label>
            <input
              id="prof-nome"
              className="input mt-1"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              onBlur={() => setNome(formatarNome(nome))}
              placeholder="Sensei Nome Sobrenome"
            />
          </div>

          <CampoUsuario
            id="prof-usuario"
            nomeCompleto={nome}
            valor={usuario}
            onChange={setUsuario}
          />

          <div>
            <label htmlFor="prof-senha" className="label">
              Senha de acesso
            </label>
            <input
              id="prof-senha"
              type="text"
              className="input mt-1"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
            <p className="mt-1 text-2xs text-subtle">
              Entregue ao professor no primeiro acesso.
            </p>
          </div>

          <div>
            <label htmlFor="prof-graduacao" className="label">
              Graduação
            </label>
            <input
              id="prof-graduacao"
              className="input mt-1"
              value={graduacao}
              onChange={(event) => setGraduacao(event.target.value)}
              placeholder="3º Dan · JKA"
            />
          </div>

          <div>
            <label htmlFor="prof-desde" className="label">
              No dojo desde
            </label>
            <input
              id="prof-desde"
              className="input mt-1"
              value={desde}
              onChange={(event) => setDesde(event.target.value)}
              placeholder="2020"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="prof-email" className="label">
              E-mail de contato
            </label>
            <input
              id="prof-email"
              type="email"
              className="input mt-1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="professor@email.com"
            />
            <p className="mt-1 text-2xs text-subtle">
              Não é usado para entrar — serve para contato e, futuramente, para
              o envio de comprovantes.
            </p>
          </div>

          {erro ? (
            <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad sm:col-span-2">
              {erro}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <Button type="submit" size="sm">
              Cadastrar professor
            </Button>
          </div>
        </form>
      </section>

      <Modal
        open={confirmado !== null}
        onClose={() => setConfirmado(null)}
        titulo="Professor cadastrado"
      >
        <p className="text-sm text-muted">
          {nomeConfirmado} já pode receber turmas e entrar no portal com o
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
    </div>
  );
}
