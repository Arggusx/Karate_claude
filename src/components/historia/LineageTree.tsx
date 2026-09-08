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
 * A linhagem vai em três árvores em vez de uma só.
 *
 * Uma árvore única chegava a cinco níveis de recuo e ficava ilegível: o leitor
 * perdia de vista quem descendia de quem. Cortada por geração — Okinawa, o
 * fundador, a difusão — cada árvore tem no máximo três níveis, e o título de
 * cada seção já diz em que momento histórico se está.
 */
export const LINHAGEM_OKINAWA: NoLinhagem = {
  nome: 'Sokon "Bushi" Matsumura',
  papel:
    "Guarda-costas do rei de Ryūkyū e patriarca do Shuri-te, a raiz de onde sai o Shotokan.",
  anos: "1809 — 1899",
  filhos: [
    {
      nome: "Anko Asato",
      papel:
        "Um dos dois mestres de Funakoshi. Nobre e espadachim, ensinava à noite, no quintal de casa.",
      anos: "1827 — 1906",
    },
    {
      nome: "Anko Itosu",
      papel:
        "O outro mestre de Funakoshi. Criou a série Heian e levou o karatê às escolas de Okinawa em 1901.",
      anos: "1831 — 1915",
      filhos: [
        {
          nome: "Gichin Funakoshi",
          papel:
            "Formado por Asato e Itosu em conjunto. Leva o karatê a Tóquio em 1922 e não volta mais.",
          anos: "1868 — 1957",
        },
      ],
    },
  ],
};

export const LINHAGEM_JAPAO: NoLinhagem = {
  nome: "Gichin Funakoshi",
  papel: "Criador do Karatê Shotokan",
  anos: "1868 — 1957",
  filhos: [
    {
      nome: "Yoshitaka (Gigō) Funakoshi",
      papel:
        "Filho do fundador. Cria as bases longas, os chutes altos e o kumite dinâmico — a técnica que hoje se reconhece como Shotokan. Morre de tuberculose aos 39.",
      anos: "1906 — 1945",
    },
    {
      nome: "Isao Obata",
      papel:
        "Aluno de Funakoshi em Keio e 1º presidente da JKA. Deixa a organização por discordar do rumo esportivo.",
      anos: "1904 — 1976",
    },
    {
      nome: "Tsutomu Ohshima",
      papel:
        "Aluno de Funakoshi em Waseda. Leva o karatê aos EUA em 1955 e preserva o método anterior à JKA, sem competição.",
      org: "SKA",
    },
    {
      nome: "Masatoshi Nakayama",
      papel:
        "Entra no clube da Takushoku em 1932 e vira aluno de Funakoshi. Mestre-chefe da JKA, sistematiza o currículo, cria o curso de instrutores e escreve a série Best Karate.",
      anos: "1913 — 1987",
      org: "JKA",
      filhos: [
        {
          nome: "Hirokazu Kanazawa",
          papel:
            "1º campeão da JKA (1957), vence a final com a mão quebrada. Abre a Inglaterra em 1965 e funda a SKIF.",
          anos: "1931 — 2019",
          org: "SKIF",
        },
        {
          nome: "Keinosuke Enoeda",
          papel:
            "Apelidado de 'Tigre'. Fixa-se no Reino Unido em 1965 e forma gerações de britânicos.",
          anos: "1935 — 2003",
          org: "KUGB",
        },
        {
          nome: "Teruyuki Okazaki",
          papel:
            "Vai aos EUA em 1961 e padroniza o ensino nas Américas. Fundador da ISKF.",
          anos: "1931 — 2020",
          org: "ISKF",
        },
        {
          nome: "Hiroshi Shirai",
          papel:
            "Enviado à Itália em 1965. Constrói ali uma das escolas mais fortes da Europa.",
          org: "FIKTA",
        },
        {
          nome: "Hideo Ochi",
          papel: "Vai à Alemanha em 1970 e funda o DJKB.",
          org: "DJKB",
        },
        {
          nome: "Tetsuhiko Asai",
          papel:
            "Movimento circular e chicoteado, katas raros. Funda a JKS depois da cisão da JKA.",
          anos: "1935 — 2006",
          org: "JKS",
        },
        {
          nome: "Mikio Yahara",
          papel:
            "Levou o ikken hissatsu — 'um golpe, uma vida' — ao extremo. Funda a KWF.",
          org: "KWF",
        },
      ],
    },
    {
      nome: "Hidetaka Nishiyama",
      papel:
        "Cofundador da JKA. Vai aos EUA em 1961 e passa a vida defendendo o karatê como budo, não como esporte.",
      anos: "1928 — 2008",
      org: "ITKF",
      filhos: [
        { nome: "Avi Rokah", papel: "Instrutor-chefe da ITKF." },
        {
          nome: "Vladimir Jorga",
          papel: "Difusão na Iugoslávia e na Europa Oriental.",
        },
        { nome: "Justo Gómez", papel: "Difusão na América Latina." },
      ],
    },
    {
      nome: "Taiji Kase",
      papel:
        "Aluno de Funakoshi e de Gigō. Instala-se em Paris em 1967 e desenvolve um Shotokan voltado ao combate real.",
      anos: "1929 — 2004",
      org: "Kase Ha",
      filhos: [
        { nome: "Dirk Heene", papel: "Kase Ha na Bélgica." },
        { nome: "Jean-Pierre Lavorato", papel: "Kase Ha na França." },
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

/**
 * Ramificação brasileira, em árvore própria.
 *
 * Está separada da linhagem japonesa de propósito: pendurar os pioneiros do
 * Brasil sob um mestre específico sugeriria uma filiação única que não existe
 * — eles vieram por caminhos e convites diferentes, em dez anos. A raiz aqui é
 * a JKA como instituição, não uma pessoa.
 */
export const LINHAGEM_BRASIL: NoLinhagem = {
  nome: "Shotokan — origem no Japão",
  papel:
    "A raiz aqui é o estilo, não uma organização: os pioneiros vieram por caminhos diferentes, e nem todos eram da JKA.",
  filhos: [
    {
      nome: "Mitsusuke Harada",
      papel:
        "Primeiro a ensinar Shotokan no Brasil. Chega a São Paulo em 1955 para trabalhar no Banco América do Sul; no mesmo ano recebe o 5º Dan das mãos do próprio Funakoshi, aos 28. Segue a linha Shotokai, não a JKA. Parte para a Europa em 1963.",
      anos: "1928 — 2021",
      org: "1955 · São Paulo",
    },
    {
      nome: "Juichi Sagara",
      papel:
        "Formado na Takushoku. Chega a São Paulo em 1957 e funda a Federação Paulista de Karatê em 1959. Chegou ao 9º Dan e é um dos principais precursores da arte no país.",
      org: "1957 · São Paulo",
      filhos: [
        {
          nome: "Sensei Edson Nakama",
          papel: "7º / 8º Dan — tradição budo e alto rendimento.",
          org: "Dojo Nakama / FPK / CBK",
        },
      ],
    },
    {
      nome: "Sadamu Uriu",
      papel:
        "Também formado na Takushoku, chega em 1958 e se estabelece no Rio de Janeiro. Um dos nomes mais respeitados da primeira geração — há dojos batizados em sua homenagem, inclusive em Alagoas.",
      org: "1958 · Rio de Janeiro",
    },
    {
      nome: "Yasutaka Tanaka",
      papel:
        "Chega no mesmo grupo do fim dos anos 1950 e participa da consolidação do Shotokan no país.",
      org: "1958 · São Paulo",
    },
    {
      nome: "Yoshizo Machida",
      papel:
        "Desembarca em Belém em abril de 1968, aos 21 anos, com três mudas de roupa e três palavras em português. Vence o torneio de Brasília em 1970 e transforma o Pará num polo do Shotokan.",
      org: "1968 · Belém, PA",
      filhos: [
        {
          nome: "Lyoto Machida",
          papel:
            "Filho de Yoshizo, faixa preta de Shotokan desde a infância. Campeão dos meio-pesados do UFC em 2009 — levou o karatê tradicional ao MMA de elite e provou que a base funciona fora do tatame.",
          anos: "1978 —",
        },
        {
          nome: "Chinzo Machida",
          papel:
            "Irmão de Lyoto e também filho de Yoshizo. Campeão de karatê e um dos responsáveis por difundir o Machida Karate.",
        },
      ],
    },
    {
      nome: "Taketo Okuda",
      papel:
        "Chega em 1972 como o primeiro mestre formado no curso de instrutores da JKA enviado ao Brasil, na função de instrutor-chefe da organização no país.",
      org: "1972 · JKA Brasil",
    },
  ],
};

export function ArvoreGenealogica({
  raiz,
  titulo,
  legenda,
  rodape,
}: {
  raiz: NoLinhagem;
  titulo: string;
  legenda?: string;
  rodape?: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <h3 className="heading-md">{titulo}</h3>
        {legenda ? (
          <span className="text-2xs text-subtle">{legenda}</span>
        ) : null}
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

      {rodape ? (
        <p className="border-t border-line px-4 py-2.5 text-2xs text-subtle">
          {rodape}
        </p>
      ) : null}
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
