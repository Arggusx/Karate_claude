import Link from "next/link";

const COLUNAS = [
  {
    titulo: "Portal de Estudos",
    links: [
      { href: "/estudos", label: "Home dos Estudos" },
      { href: "/estudos/historia", label: "História" },
      { href: "/estudos/tecnicas", label: "Técnicas e Katas" },
      { href: "/estudos/fundamentos", label: "Fundamentos" },
    ],
  },
  {
    titulo: "Academia",
    links: [
      { href: "/#beneficios", label: "Benefícios" },
      { href: "/#dojo", label: "O Dojo" },
      { href: "/#matricula", label: "Mensalidade" },
      { href: "/login", label: "Área do aluno" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="section grid gap-8 py-10 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-2xs font-semibold text-white">
              松
            </span>
            <span className="text-sm font-semibold tracking-[-0.01em] text-fg">
              Portal Shotokan
            </span>
          </div>
          <p className="body-muted mt-3 max-w-sm">
            Academia e plataforma de estudos de Karatê Shotokan. Tradição de
            Okinawa, método moderno e acompanhamento contínuo do praticante.
          </p>
        </div>

        {COLUNAS.map((coluna) => (
          <div key={coluna.titulo}>
            <p className="text-2xs font-semibold uppercase tracking-[0.1em] text-fg">
              {coluna.titulo}
            </p>
            <ul className="mt-3 space-y-2">
              {coluna.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-150 hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="section flex flex-col gap-2 border-t border-line py-4 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Portal Shotokan. Todos os direitos
          reservados.
        </p>
        <p>空手に先手なし — No karatê, não existe atitude ofensiva.</p>
      </div>
    </footer>
  );
}
