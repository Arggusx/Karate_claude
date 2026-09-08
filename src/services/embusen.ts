/**
 * Embusen (演武線) — a linha de deslocamento do kata.
 *
 * O traçado é FATO sobre o kata, não obra de ninguém: o Heian Shodan desenhar
 * um "I" no chão é como dizer que a água ferve a 100 °C. Por isso é desenhado
 * aqui do zero, em coordenadas, e não copiado de ilustração de livro — a
 * ilustração tem autor, a forma não.
 *
 * Desenhar em vez de usar imagem também é o que torna a animação possível: um
 * PNG não tem caminho para percorrer; um polígono de pontos tem.
 */

/** Onde o praticante está e para onde olha, a cada movimento. */
export interface PassoEmbusen {
  /** Número do movimento, igual ao da lista do kata. */
  numero: number;
  /** Posição no tatame, em passos. x cresce à direita, y cresce para cima. */
  x: number;
  y: number;
  /** Direção do olhar em graus; 0 = frente (shomen), 90 = direita. */
  olhar: number;
  /** Base usada no movimento, quando identificada. */
  base?: string;
  /** Movimento com kiai. */
  kiai?: boolean;
  /**
   * Foto do movimento sendo executado, em `/public`. Opcional de propósito:
   * o diagrama funciona sem nenhuma, e cada foto que chegar aparece sozinha
   * no passo correspondente.
   */
  foto?: string;
  /** Quem aparece na foto — crédito exibido junto dela. */
  fotoCredito?: string;
}

export interface TracadoEmbusen {
  /** Nome da forma, para a legenda: "I" (工), "linha reta", etc. */
  forma: string;
  passos: PassoEmbusen[];
  /**
   * Marcado enquanto o traçado não foi conferido contra uma referência
   * confiável. A interface avisa o leitor em vez de ensinar errado.
   */
  emConferencia?: boolean;
}

/** Extrai a base do texto do movimento ("... em Kokutsu-dachi -> ..."). */
export function baseDoMovimento(texto: string): string | undefined {
  const achado = /\b([A-Za-zÀ-ÿ]+-dachi)\b/.exec(texto);
  return achado?.[1];
}

/**
 * Traçados conhecidos, por id de kata.
 *
 * Só entram aqui os katas cujo deslocamento eu consigo afirmar. Kata sem
 * traçado confiável fica de fora de propósito: num site de estudo, embusen
 * errado ensina errado — pior do que não ter.
 */
export const TRACADOS: Record<string, TracadoEmbusen> = {
  /**
   * Heian Shodan — forma de "I" (工).
   *
   * Conferido posição a posição contra o diagrama e o descritivo do
   * karateka.it. Duas observações que explicam o traçado:
   *
   * - Aquela referência numera 22 movimentos porque conta o `age shuto uke`
   *   executado *no lugar* como movimento próprio. Ele não desloca ninguém,
   *   então aqui continua fazendo parte do nosso movimento 6 — a partir do 7
   *   a nossa numeração fica um abaixo da deles.
   * - O movimento 4 é o único assimétrico do kata: recolhe o pé da frente
   *   para renoji-dachi, então anda meio passo *para trás* da direção do
   *   olhar. É por isso que ele cai entre os movimentos 3 e 5, e não além.
   *
   * Os giros de 180° (movimentos 3 e 12) voltam para a linha central porque o
   * pé de trás é que gira em arco: o pé da frente novo cai onde o de trás
   * estava. Daí 3 e 12 dividirem ponto com o início e com o 9.
   */
  "heian-shodan": {
    forma: "I (工)",
    passos: [
      { numero: 1, x: -1, y: 0, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 2, x: -2, y: 0, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 3, x: 0, y: 0, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 4, x: -0.5, y: 0, olhar: 90, base: "Renoji-dachi" },
      { numero: 5, x: 1, y: 0, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 6, x: 0, y: 1, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 7, x: 0, y: 2, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 8, x: 0, y: 3, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 9, x: 0, y: 4, olhar: 0, base: "Zenkutsu-dachi", kiai: true },
      { numero: 10, x: 1, y: 4, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 11, x: 2, y: 4, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 12, x: 0, y: 4, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 13, x: -1, y: 4, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 14, x: 0, y: 3, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 15, x: 0, y: 2, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 16, x: 0, y: 1, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 17, x: 0, y: 0, olhar: 180, base: "Zenkutsu-dachi", kiai: true },
      { numero: 18, x: -1, y: 0, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 19, x: -1.71, y: 0.71, olhar: 315, base: "Kokutsu-dachi" },
      { numero: 20, x: 0, y: 0, olhar: 90, base: "Kokutsu-dachi" },
      { numero: 21, x: 0.71, y: 0.71, olhar: 45, base: "Kokutsu-dachi" },
    ],
  },
};

export function tracadoDoKata(id: string): TracadoEmbusen | undefined {
  return TRACADOS[id];
}
