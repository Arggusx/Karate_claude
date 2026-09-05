"use client";

import { useEffect, useRef } from "react";
import { useAcademia } from "@/lib/academiaStore";
import { normalizarUsuario, sugerirUsuario } from "@/services/dataService";

/**
 * Campo de nome de usuário. A escolha é livre: "nome.sobrenome" é apenas uma
 * sugestão pré-preenchida a partir do nome completo, e ela para de se
 * atualizar assim que alguém edita o campo.
 */
export function CampoUsuario({
  id,
  nomeCompleto,
  valor,
  onChange,
}: {
  id: string;
  nomeCompleto: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  const { usuarioEmUso, usuarioDisponivel } = useAcademia();
  const editadoManualmente = useRef(false);

  const sugestao = sugerirUsuario(nomeCompleto);

  useEffect(() => {
    if (editadoManualmente.current) return;
    onChange(sugestao ? usuarioDisponivel(sugestao) : "");
  }, [sugestao, usuarioDisponivel, onChange]);

  const normalizado = normalizarUsuario(valor);
  const emUso = normalizado.length > 0 && usuarioEmUso(normalizado);
  const curto = normalizado.length > 0 && normalizado.length < 3;
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
        className="input mt-1 font-mono"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        value={valor}
        onChange={(event) => {
          editadoManualmente.current = true;
          onChange(event.target.value);
        }}
        placeholder="escolha livre — ex.: rafa.kata"
      />

      {emUso ? (
        <p className="mt-1 text-2xs text-status-bad">
          Este usuário já existe. Disponível: {usuarioDisponivel(normalizado)}
        </p>
      ) : curto ? (
        <p className="mt-1 text-2xs text-status-bad">
          Use ao menos 3 caracteres.
        </p>
      ) : ajustado ? (
        <p className="mt-1 text-2xs text-status-warn">
          Será salvo como{" "}
          <span className="font-mono font-medium">{normalizado}</span> —
          minúsculas, sem acento e sem espaço.
        </p>
      ) : (
        <p className="mt-1 text-2xs text-subtle">
          Escolha livre do aluno; a sugestão acima é só um atalho. Precisa ser
          único no dojo.
        </p>
      )}
    </div>
  );
}
