import { Badge } from "@/components/ui/Badge";
import type { Mestre } from "@/types";

export interface NoLinhagem {
  nome: string;
  papel?: string;
  anos?: string;
  org?: string;
  filhos?: NoLinhagem[];
}

/**
 * Árvore genealógica montada a partir de `textFiles.arvoreMestres` e da
 * `tabelaGenealogica` do acervo — de Matsumura aos dojos brasileiros.
 */
export const LINHAGEM: NoLinhagem = {
  nome: 'Sokon "Bushi" Matsumura',
  papel: "Patriarca do Shuri-te",
  anos: "1809 — 1899",
  filhos: [
    {
      nome: "Anko Asato",
      papel: "Mestre direto de Funakoshi",
      anos: "1827 — 1906",
    },
    {
      nome: "Anko Itosu",
      papel: "Criador da série Heian",
      anos: "1831 — 1915",
      filhos: [
        {
          nome: "Gichin Funakoshi",
          papel: "Criador do Karatê Shotokan",
          anos: "1868 — 1957",
          filhos: [
            {
              nome: "Yoshitaka (Gigō) Funakoshi",
              papel: "Inovação técnica — kumite e chutes altos",
              anos: "1906 — 1945",
            },
            {
              nome: "Isao Obata",
              papel: "1º presidente da JKA",
              filhos: [
                {
                  nome: "Tsutomu Ohshima",
                  papel: "Karatê pré-JKA preservado",
                  org: "SKA",
                },
              ],
            },
            {
              nome: "Masatoshi Nakayama",
              papel: "Mestre-chefe da JKA",
              anos: "1913 — 1987",
              filhos: [
                {
                  nome: "Hirokazu Kanazawa",
                  papel: "Fluidez, kata e saúde",
                  org: "SKIF",
                },
                {
                  nome: "Keinosuke Enoeda",
                  papel: "Expansão no Reino Unido",
                  org: "KUGB / JKA",
                },
                {
                  nome: "Teruyuki Okazaki",
                  papel: "Padronização técnica pan-americana",
                  org: "ISKF",
                },
                {
                  nome: "Mikio Yahara",
                  papel: "Biomecânica extrema — ikken hissatsu",
                  org: "KWF",
                },
                {
                  nome: "Tetsuhiko Asai",
                  papel: "Movimentos circulares e katas flexíveis",
                  org: "JKS",
                  filhos: [
                    {
                      nome: "Juichi Sagara",
                      papel: "Pioneiro da JKA na América do Sul",
                      filhos: [
                        {
                          nome: "Sensei Edson Nakama",
                          papel: "7º / 8º Dan — tradição budo e alto rendimento",
                          org: "Dojo Nakama / FPK / CBK",
                        },
                      ],
                    },
                    {
                      nome: "Yasutaka Tanaka",
                      papel: "Consolidação do Shotokan no Brasil",
                      org: "JKA Brasil",
                    },
                  ],
                },
              ],
            },
            {
              nome: "Hidetaka Nishiyama",
              papel: "Karatê tradicional como budo",
              anos: "1928 — 2008",
              org: "ITKF",
              filhos: [
                { nome: "Avi Rokah", papel: "Instrutor-chefe ITKF" },
                { nome: "Vladimir Jorga", papel: "Difusão na Europa Oriental" },
                { nome: "Justo Gómez", papel: "Difusão na América Latina" },
              ],
            },
            {
              nome: "Taiji Kase",
              papel: "Aplicação prática e combate real",
              anos: "1929 — 2004",
              org: "Kase Ha / WKSA",
              filhos: [
                {
                  nome: "Hiroshi Shirai",
                  papel: "Shotokan na Itália",
                  org: "FIKTA / ITKF",
                },
                { nome: "Dirk Heene", papel: "Kase Ha na Bélgica" },
                {
                  nome: "Jean-Pierre Lavorato",
                  papel: "Kase Ha na França",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

function NoCard({ no }: { no: NoLinhagem }) {
  return (
    <div className="card card-hover border-l-2 border-l-accent px-3 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-xs font-semibold text-fg">{no.nome}</span>
        <span className="flex items-center gap-2">
          {no.org ? <Badge tone="accent">{no.org}</Badge> : null}
          {no.anos ? (
            <span className="text-2xs tabular-nums text-subtle">{no.anos}</span>
          ) : null}
        </span>
      </div>
      {no.papel ? (
        <p className="mt-0.5 text-2xs leading-relaxed text-muted">{no.papel}</p>
      ) : null}
    </div>
  );
}

function Ramo({ no }: { no: NoLinhagem }) {
  return (
    <li className="tree-item">
      <NoCard no={no} />
      {no.filhos?.length ? (
        <ul className="tree-children mt-2">
          {no.filhos.map((filho) => (
            <Ramo key={filho.nome} no={filho} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ArvoreGenealogica({ raiz = LINHAGEM }: { raiz?: NoLinhagem }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <h3 className="heading-md">Árvore genealógica completa</h3>
        <span className="text-2xs text-subtle">
          De Matsumura aos dojos brasileiros
        </span>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[420px]">
          <NoCard no={raiz} />
          <ul className="tree-children mt-2">
            {raiz.filhos?.map((filho) => (
              <Ramo key={filho.nome} no={filho} />
            ))}
          </ul>
        </div>
      </div>

      <p className="border-t border-line px-4 py-2.5 text-2xs text-subtle">
        Linhas contínuas indicam ensino direto. Asato e Itosu formaram Gichin
        Funakoshi em conjunto; a árvore segue por Itosu para manter a leitura
        vertical.
      </p>
    </div>
  );
}

/** Ficha dos mestres do acervo, exibida abaixo da árvore. */
export function FichasMestres({ mestres }: { mestres: Mestre[] }) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {mestres.map((mestre) => (
        <article key={mestre.nome} className="card p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold text-fg">{mestre.nome}</h3>
            <span className="shrink-0 text-2xs tabular-nums text-subtle">
              {mestre.anos}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted">{mestre.kanji}</p>
          <p className="mt-2 text-xs leading-relaxed text-fg/80">
            {mestre.text}
          </p>
        </article>
      ))}
    </div>
  );
}
