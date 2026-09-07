/* eslint-disable @next/next/no-img-element */

/**
 * Tora no Maki — "o rolo do tigre".
 *
 * O emblema que Hoan Kosugi desenhou para a capa de Ryukyu Kempo Karate (1922),
 * o primeiro livro de Gichin Funakoshi, e que virou o símbolo do Shotokan. O
 * tigre no círculo é lido como "o tigre nunca dorme" — vigilância constante.
 *
 * Arquivo e licença registrados em public/imagens/CREDITOS.md. Usa <img> em vez
 * de next/image de propósito: é sempre decoração de tamanho fixo e o arquivo
 * já é pequeno, então o otimizador não pagaria o próprio custo.
 *
 * O original tem 119x120: serve para marca-d'água e emblema pequeno, mas
 * perde nitidez acima de ~240px. Não amplie além disso.
 */
export function Tora({
  className,
  titulo,
}: {
  className?: string;
  /** Sem título, o emblema é decorativo e sai da árvore de acessibilidade. */
  titulo?: string;
}) {
  return (
    <img
      src="/imagens/tora-no-maki.png"
      alt={titulo ?? ""}
      aria-hidden={titulo ? undefined : true}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
