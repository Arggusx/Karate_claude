"use client";

import { useEffect, useRef, useState } from "react";
import { useAcademia } from "@/lib/academiaStore";
import { useDebounce } from "@/lib/useDebounce";
import { normalizarUsuario, sugerirUsuario } from "@/services/dataService";

export type StatusUsuario = "vazio" | "curto" | "checando" | "livre" | "ocupado";

/**
 * Campo de nome de usuário. A escolha é livre: "nome.sobrenome" é apenas uma
 * sugestão pré-preenchida a partir do nome completo, e ela para de se
 * atualizar assim que alguém edita o campo. A disponibilidade é verificada
 * 400 ms depois da última tecla e comunicada ao formulário por `onStatus`.
 */
export function CampoUsuario({
  id,
  nomeCompleto,
  valor,
  onChange,
  onStatus,
}: {
  id: string;
  nomeCompleto: string;
  valor: string;
  onChange: (valor: string) => void;
  onStatus?: (status: StatusUsuario) => void;
}) {
  const { usuarioEmUso, usuarioDisponivel } = useAcademia();
  const editadoManualmente = useRef(false);
  const [checando, setChecando] = useState(false);

  const sugestao = sugerirUsuario(nomeCompleto);
  const normalizado = normalizarUsuario(valor);
  const adiado = useDebounce(normalizado, 400);

  useEffect(() => {
    if (editadoManualmente.current) return;
    onChange(sugestao ? usuarioDisponivel(sugestao) : "");
  }, [sugestao, usuarioDisponivel, onChange]);

  // Enquanto o valor digitado não "assenta", a checagem fica pendente.
  useEffect(() => {
    setChecando(normalizado.length >= 3 && normalizado !== adiado);
  }, [normalizado, adiado]);

  const status: StatusUsuario =
    normalizado.length === 0
      ? "vazio"
      : normalizado.length < 3
        ? "curto"
        : checando
          ? "checando"
          : usuarioEmUso(adiado)
            ? "ocupado"
            : "livre";

  useEffect(() => onStatus?.(status), [status, onStatus]);

  const ajustado = valor.length > 0 && normalizado !== valor;
  const podeSugerir =
    sugestao.length > 0 && normalizado !== usuarioDisponivel(sugestao);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="label">
          Nome de usuário
        </label>
        {podeSugerir ? (
          <button
            type="button"
            onClick={() => {
              editadoManualmente.current = true;
              onChange(usuarioDisponivel(sugestao));
            }}
            className="text-2xs font-medium text-accent hover:underline"
          >
            usar {usuarioDisponivel(sugestao)}
          </button>
        ) : null}
      </div>

      <input
        id={id}
        className={`input mt-1 font-mono ${
          status === "ocupado"
            ? "border-status-bad focus:border-status-bad"
            : status === "livre"
              ? "border-status-ok/60 focus:border-status-ok"
              : ""
        }`}
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        aria-invalid={status === "ocupado" || status === "curto"}
        aria-describedby={`${id}-status`}
        value={valor}
        onChange={(event) => {
          editadoManualmente.current = true;
          onChange(event.target.value);
        }}
        placeholder="escolha livre — ex.: rafa.kata"
      />

      <p id={`${id}-status`} className="mt-1 text-2xs" aria-live="polite">
        {status === "ocupado" ? (
          <span className="text-status-bad">
            Nome de usuário já em uso. Disponível:{" "}
            <span className="font-mono">{usuarioDisponivel(adiado)}</span>
          </span>
        ) : status === "curto" ? (
          <span className="text-status-bad">Use ao menos 3 caracteres.</span>
        ) : status === "checando" ? (
          <span className="text-muted">Verificando disponibilidade…</span>
        ) : status === "livre" ? (
          <span className="text-status-ok">
            Usuário disponível
            {ajustado ? (
              <span className="text-muted">
                {" "}
                — será salvo como{" "}
                <span className="font-mono">{normalizado}</span>
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-subtle">
            Escolha livre do aluno; a sugestão acima é só um atalho.
          </span>
        )}
      </p>
    </div>
  );
}
