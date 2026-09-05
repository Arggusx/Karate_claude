"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAcademia } from "@/lib/academiaStore";
import type { AulaPlano, Turma } from "@/types";

const DIAS_SEMANA = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

interface Rascunho {
  nome: string;
  faixaEtaria: string;
  dias: string[];
  inicio: string;
  fim: string;
  faixasTipicas: string;
  professorId: string;
  plano: AulaPlano[];
}

const VAZIO: Rascunho = {
  nome: "",
  faixaEtaria: "",
  dias: ["Terça", "Quinta"],
  inicio: "18:30",
  fim: "19:30",
  faixasTipicas: "",
  professorId: "",
  plano: [],
};

/** Formulário de criação e edição de turma, incluindo o conteúdo das aulas. */
export function TurmaFormModal({
  open,
  onClose,
  turma,
}: {
  open: boolean;
  onClose: () => void;
  turma?: Turma | null;
}) {
  const { professores, criarTurma, atualizarTurma } = useAcademia();
  const [rascunho, setRascunho] = useState<Rascunho>(VAZIO);

  useEffect(() => {
    if (!open) return;
    setRascunho(
      turma
        ? {
            nome: turma.nome,
            faixaEtaria: turma.faixaEtaria,
            dias: turma.dias,
            inicio: turma.inicio,
            fim: turma.fim,
            faixasTipicas: turma.faixasTipicas,
            professorId: turma.professorId,
            plano: turma.plano,
          }
        : { ...VAZIO, professorId: professores[0]?.id ?? "" },
    );
  }, [open, turma, professores]);

  function alternarDia(dia: string) {
    setRascunho((atual) => ({
      ...atual,
      dias: atual.dias.includes(dia)
        ? atual.dias.filter((item) => item !== dia)
        : [...atual.dias, dia],
    }));
  }

  function atualizarAula(indice: number, mudanca: Partial<AulaPlano>) {
    setRascunho((atual) => ({
      ...atual,
      plano: atual.plano.map((aula, i) =>
        i === indice ? { ...aula, ...mudanca } : aula,
      ),
    }));
  }

  function adicionarAula() {
    setRascunho((atual) => ({
      ...atual,
      plano: [
        ...atual.plano,
        { dia: atual.dias[0] ?? "Terça", foco: "", conteudo: [] },
      ],
    }));
  }

  function removerAula(indice: number) {
    setRascunho((atual) => ({
      ...atual,
      plano: atual.plano.filter((_, i) => i !== indice),
    }));
  }

  function salvar() {
    if (!rascunho.nome.trim()) return;
    if (turma) {
      atualizarTurma(turma.id, rascunho);
    } else {
      criarTurma(rascunho);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      titulo={turma ? `Editar turma — ${turma.nome}` : "Nova turma"}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="turma-nome" className="label">
              Nome da turma
            </label>
            <input
              id="turma-nome"
              className="input mt-1"
              value={rascunho.nome}
              onChange={(event) =>
                setRascunho({ ...rascunho, nome: event.target.value })
              }
              placeholder="Infantil"
            />
          </div>
          <div>
            <label htmlFor="turma-idade" className="label">
              Faixa etária
            </label>
            <input
              id="turma-idade"
              className="input mt-1"
              value={rascunho.faixaEtaria}
              onChange={(event) =>
                setRascunho({ ...rascunho, faixaEtaria: event.target.value })
              }
              placeholder="7 a 12 anos"
            />
          </div>
          <div>
            <label htmlFor="turma-inicio" className="label">
              Início
            </label>
            <input
              id="turma-inicio"
              type="time"
              className="input mt-1"
              value={rascunho.inicio}
              onChange={(event) =>
                setRascunho({ ...rascunho, inicio: event.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="turma-fim" className="label">
              Término
            </label>
            <input
              id="turma-fim"
              type="time"
              className="input mt-1"
              value={rascunho.fim}
              onChange={(event) =>
                setRascunho({ ...rascunho, fim: event.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="turma-faixas" className="label">
              Faixas típicas
            </label>
            <input
              id="turma-faixas"
              className="input mt-1"
              value={rascunho.faixasTipicas}
              onChange={(event) =>
                setRascunho({ ...rascunho, faixasTipicas: event.target.value })
              }
              placeholder="Branca até amarela / vermelha"
            />
          </div>
          <div>
            <label htmlFor="turma-professor" className="label">
              Professor responsável
            </label>
            <select
              id="turma-professor"
              className="input mt-1"
              value={rascunho.professorId}
              onChange={(event) =>
                setRascunho({ ...rascunho, professorId: event.target.value })
              }
            >
              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="label">Dias da semana</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {DIAS_SEMANA.map((dia) => {
              const ativo = rascunho.dias.includes(dia);
              return (
                <button
                  key={dia}
                  type="button"
                  onClick={() => alternarDia(dia)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    ativo
                      ? "border-accent bg-accent text-white"
                      : "border-line bg-surface text-muted hover:border-line-strong hover:text-fg"
                  }`}
                >
                  {dia}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-line pt-3">
          <div className="flex items-center justify-between">
            <p className="label">Conteúdo das aulas</p>
            <Button size="sm" variant="secondary" onClick={adicionarAula}>
              + Aula
            </Button>
          </div>

          <div className="mt-2 space-y-2">
            {rascunho.plano.length === 0 ? (
              <p className="text-xs text-subtle">
                Nenhuma aula planejada nesta turma.
              </p>
            ) : null}

            {rascunho.plano.map((aula, indice) => (
              <div
                key={indice}
                className="rounded-md border border-line bg-canvas p-3"
              >
                <div className="flex gap-2">
                  <select
                    aria-label="Dia da aula"
                    className="input"
                    value={aula.dia}
                    onChange={(event) =>
                      atualizarAula(indice, { dia: event.target.value })
                    }
                  >
                    {DIAS_SEMANA.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Foco da aula"
                    className="input"
                    value={aula.foco}
                    onChange={(event) =>
                      atualizarAula(indice, { foco: event.target.value })
                    }
                    placeholder="Foco (ex.: Kihon e kata)"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removerAula(indice)}
                  >
                    Remover
                  </Button>
                </div>
                <textarea
                  aria-label="Conteúdo da aula"
                  className="input mt-2 h-24 resize-y py-2 leading-relaxed"
                  value={aula.conteudo.join("\n")}
                  onChange={(event) =>
                    atualizarAula(indice, {
                      conteudo: event.target.value.split("\n"),
                    })
                  }
                  placeholder={"Um item por linha"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-3">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={salvar}>
            {turma ? "Salvar alterações" : "Criar turma"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
