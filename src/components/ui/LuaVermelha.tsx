import { cn } from "@/lib/cn";

/**
 * Lua vermelha — marca-d'água da abertura.
 *
 * Desenhada em CSS, não em imagem: é só um disco com queda radial, então
 * escala para qualquer tamanho sem perder nitidez e não custa requisição.
 *
 * O brilho é feito com três `box-shadow` empilhados, do mais fechado ao mais
 * aberto. Um `blur` só borraria o disco inteiro; as sombras deixam o miolo
 * nítido e espalham a luz para fora, que é o que dá a leitura de neon.
 */
export function LuaVermelha({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative rounded-full", className)}
      style={{
        background:
          "radial-gradient(circle at 50% 50%, " +
          "rgba(248,113,113,0.95) 0%, " +
          "rgba(220,38,38,0.9) 45%, " +
          "rgba(185,28,28,0.8) 70%, " +
          "rgba(153,27,27,0.55) 88%, " +
          "rgba(153,27,27,0) 100%)",
        boxShadow:
          "0 0 40px 8px rgba(220,38,38,0.55), " +
          "0 0 110px 30px rgba(220,38,38,0.35), " +
          "0 0 220px 80px rgba(220,38,38,0.18)",
      }}
    />
  );
}
