/* eslint-disable @next/next/no-img-element */

/**
 * Marca do Torakan: a lua vermelha rasgada por garras, dentro do crescente.
 *
 * A arte é do cliente, gerada por ele. O que foi feito aqui: recorte no
 * conteúdo e remoção do fundo azul-acinzentado original — por varredura a
 * partir das bordas, não por cor, para que a sombra escura dentro do cobre e
 * o interior dos cortes continuem opacos. Sem isso, o logo abria buracos
 * brancos quando o tema claro está ativo.
 *
 * O favicon sai do mesmo arquivo (src/app/icon.png e apple-icon.png), então a
 * marca é a mesma em toda parte.
 *
 * Usa <img> em vez de next/image de propósito: é decoração de tamanho fixo e
 * pequeno, e o otimizador não pagaria o próprio custo.
 */
export function MarcaTorakan({ className }: { className?: string }) {
  return (
    <img
      src="/imagens/marca-torakan.png"
      alt=""
      aria-hidden
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
