"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAcademia } from "@/lib/academiaStore";
import type { Aluno } from "@/types";

/**
 * Troca de turma com confirmação. O select não altera nada sozinho: abre o
 * diálogo e só grava depois do "confirmar", avisando por toast no fim.
 */
export function SeletorTurma({ aluno }: { aluno: Aluno }) {
  const { turmas, moverAluno } = useAcademia();
  const toast = useToast();
  const [destinoId, setDestinoId] = useState<string | null>(null);

  const atual = turmas.find((turma) => turma.id === aluno.turmaId);
  const destino = turmas.find((turma) => turma.id === destinoId);

  function confirmar() {
    if (!destino) return;
    try {
      moverAluno(aluno.id, destino.id);
      toast(`${aluno.nome} foi movido para a turma ${destino.nome}.`);
    } catch {
      toast(`Não foi possível mover ${aluno.nome}. Tente de novo.`, "erro");
    }
    setDestinoId(null);
  }

  return (
    <>
      <select
        aria-label={`Turma de ${aluno.nome}`}
        className="input h-8 w-auto text-xs"
        value={aluno.turmaId}
        onChange={(event) => {
          if (event.target.value !== aluno.turmaId) {
            setDestinoId(event.target.value);
          }
        }}
      >
        {turmas.map((turma) => (
          <option key={turma.id} value={turma.id}>
            {turma.nome}
          </option>
        ))}
      </select>

      <Modal
        open={destinoId !== null}
        onClose={() => setDestinoId(null)}
        titulo="Confirmar troca de turma"
      >
        <p className="text-sm leading-relaxed text-muted">
          Mover <span className="font-medium text-fg">{aluno.nome}</span> da
          turma <span className="font-medium text-fg">{atual?.nome}</span> para{" "}
          <span className="font-medium text-fg">{destino?.nome}</span>?
        </p>
        {destino ? (
          <p className="mt-2 text-2xs text-subtle">
            Novo horário: {destino.dias.join(" e ")}, {destino.inicio} às{" "}
            {destino.fim} · {destino.faixaEtaria}
          </p>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setDestinoId(null)}
          >
            Cancelar
          </Button>
          <Button size="sm" onClick={confirmar}>
            Mover aluno
          </Button>
        </div>
      </Modal>
    </>
  );
}
