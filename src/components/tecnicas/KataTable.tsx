import Link from "next/link";
import { BeltBadge } from "@/components/ui/Badge";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { listarDestaques } from "@/services/dataService";
import type { KataCompleto } from "@/types";

export function KataTable({
  titulo,
  descricao,
  katas,
}: {
  titulo: string;
  descricao: string;
  katas: KataCompleto[];
}) {
  if (katas.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="heading-md">{titulo}</h3>
          <p className="mt-0.5 text-xs text-muted">{descricao}</p>
        </div>
        <span className="text-2xs tabular-nums text-subtle">
          {katas.length} katas
        </span>
      </div>

      <Table minWidth="min-w-[1000px]">
        <THead>
          <TR>
            <TH>Kata</TH>
            <TH className="text-right">Mov.</TH>
            <TH>Nível</TH>
            <TH>Significado</TH>
            <TH>Kiais</TH>
            <TH>Faixa recomendada</TH>
            <TH>Movimentos destaque</TH>
          </TR>
        </THead>
        <TBody>
          {katas.map((kata) => (
            <TR key={kata.id}>
              <TD>
                <Link
                  href={`/estudos/tecnicas/kata/${kata.id}`}
                  className="font-medium text-fg hover:text-accent"
                >
                  {kata.nome}
                </Link>
                {kata.kanji ? (
                  <span className="ml-1.5 text-2xs text-subtle">
                    {kata.kanji}
                  </span>
                ) : null}
              </TD>
              <TD className="text-right tabular-nums">
                {kata.quantidadeMovimentos}
              </TD>
              <TD className="whitespace-nowrap text-muted">
                {kata.nivelDificuldade}
              </TD>
              <TD className="max-w-[220px] text-muted">
                {kata.significadoNome}
              </TD>
              <TD className="whitespace-nowrap text-muted">
                {kata.posicoesKiai}
              </TD>
              <TD>
                <BeltBadge cor={kata.corFaixa}>
                  {kata.faixaRecomendada}
                </BeltBadge>
              </TD>
              <TD>
                <div className="flex flex-wrap gap-1">
                  {listarDestaques(kata).map((destaque) => (
                    <span
                      key={destaque}
                      className="rounded border border-line bg-elevated px-1.5 py-0.5 text-2xs text-muted"
                    >
                      {destaque}
                    </span>
                  ))}
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </section>
  );
}
