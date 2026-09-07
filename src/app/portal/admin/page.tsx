"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CadastroAlunoPanel } from "@/components/portal/CadastroAlunoPanel";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { CampoBusca, paraBusca } from "@/components/portal/CampoBusca";
import {
  CampoUsuario,
  type StatusUsuario,
} from "@/components/portal/CampoUsuario";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { ProfessorDetalheModal } from "@/components/portal/DetalheModal";
import { DiarioPanel } from "@/components/portal/DiarioPanel";
import { FinanceiroPanel } from "@/components/portal/FinanceiroPanel";
import { TurmasPanel } from "@/components/portal/TurmasPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Paginacao } from "@/components/ui/Paginacao";
import { SegmentedControl } from "@/components/ui/Tabs";
import { useAcademia } from "@/lib/academiaStore";
import {
  formatarNome,
  horarioDaTurma,
  idadePorNascimento,
  normalizarUsuario,
} from "@/services/dataService";
import type { Professor } from "@/types";

type Aba = "turmas" | "diario" | "financeiro" | "professores" | "cadastro";

const ABAS = [
  { value: "turmas" as const, label: "Turmas" },
  { value: "diario" as const, label: "Diário de classe" },
  { value: "financeiro" as const, label: "Financeiro" },
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
    <>
      <HeroPagina
        compacto
        sobretitulo="Portal do Admin"
        titulo="Administração do dojo"
        descricao="Tudo que o professor vê, mais o cadastro de professores e a distribuição de turmas entre eles."
        imagem="/imagens/dojo.jpg"
        acao={<Badge tone="accent">Acesso total</Badge>}
      />

      {/* Ver comentário em portal/professor: a faixa segura a barra de abas,
          separando a abertura da área de trabalho. */}
      <div className="faixa-destacada py-3">
        <div className="section">
          <SegmentedControl options={ABAS} value={aba} onChange={setAba} />
        </div>
      </div>

      <div className="section space-y-4 py-6">

      {aba === "turmas" ? (
        <TurmasPanel />
      ) : aba === "diario" ? (
        <DiarioPanel />
      ) : aba === "financeiro" ? (
        <FinanceiroPanel />
      ) : aba === "professores" ? (
        <ProfessoresPanel />
      ) : (
        <CadastroAlunoPanel />
      )}
      </div>
    </>
  );
}

const POR_PAGINA = 8;

/** Exclusivo do admin: cadastro de professores e suas turmas. */
function ProfessoresPanel() {
  const { professores, turmas, alunosDaTurma, criarProfessor } = useAcademia();
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [graduacao, setGraduacao] = useState("");
  const [email, setEmail] = useState("");
  const [desde, setDesde] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [statusUsuario, setStatusUsuario] = useState<StatusUsuario>("vazio");
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [emDetalhe, setEmDetalhe] = useState<Professor | null>(null);

  const filtrados = useMemo(() => {
    const alvo = paraBusca(busca.trim());
    if (!alvo) return professores;
    return professores.filter(
      (professor) =>
        paraBusca(professor.nome).includes(alvo) ||
        paraBusca(professor.usuario).includes(alvo),
    );
  }, [professores, busca]);

  // Qualquer filtro novo volta para a primeira página.
  useEffect(() => setPagina(1), [busca]);

  const visiveis = filtrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  async function cadastrar(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("Informe o nome completo do professor.");
      return;
    }

    const resultado = await criarProfessor({
      nome: formatarNome(nome),
      usuario,
      senha,
      graduacao: graduacao.trim() || "1º Dan",
      email: email.trim(),
      desde: desde.trim() || String(new Date().getFullYear()),
      dataNascimento: nascimento,
      idade: idadePorNascimento(nascimento),
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
    setNascimento("");
    setStatusUsuario("vazio");
  }

  const [nomeConfirmado, usuarioConfirmado] = (confirmado ?? "").split("|");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CampoBusca
          id="busca-professor"
          valor={busca}
          onChange={setBusca}
          placeholder="Buscar professor por nome ou usuário"
          className="w-full sm:max-w-xs"
        />
        <span className="text-2xs tabular-nums text-subtle">
          {filtrados.length} de {professores.length} professores
        </span>
      </div>

      {filtrados.length === 0 ? (
        <div className="card px-4 py-6 text-center">
          <p className="text-xs text-muted">
            Nenhum professor encontrado para “{busca}”.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {visiveis.map((professor) => {
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
                <button
                  type="button"
                  onClick={() => setEmDetalhe(professor)}
                  className="flex items-center gap-3 text-left"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded border border-line bg-elevated text-xs font-medium text-fg">
                    {professor.foto}
                  </span>
                  <div>
                    <h3 className="heading-md underline decoration-line underline-offset-4 hover:decoration-accent">
                      {professor.nome}
                    </h3>
                    <p className="text-2xs text-muted">{professor.email}</p>
                  </div>
                </button>
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

      <Paginacao
        total={filtrados.length}
        pagina={pagina}
        porPagina={POR_PAGINA}
        onPagina={setPagina}
        rotulo="professores"
      />

      <ProfessorDetalheModal
        professor={emDetalhe}
        onClose={() => setEmDetalhe(null)}
      />

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
            onStatus={setStatusUsuario}
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

          <div>
            <label htmlFor="prof-nascimento" className="label">
              Data de nascimento
            </label>
            <input
              id="prof-nascimento"
              type="date"
              className="input mt-1"
              value={nascimento}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setNascimento(event.target.value)}
            />
            <p className="mt-1 text-2xs text-subtle">
              {idadePorNascimento(nascimento) !== null
                ? `${idadePorNascimento(nascimento)} anos — calculado a partir daqui.`
                : "A idade é calculada a partir desta data."}
            </p>
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

          <div className="flex items-center gap-3 sm:col-span-2">
            <Button type="submit" size="sm" disabled={statusUsuario !== "livre"}>
              Cadastrar professor
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
