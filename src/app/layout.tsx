import type { Metadata } from "next";
import {
  Nanum_Brush_Script,
  Noto_Serif_Display,
  Yuji_Syuku,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { AcademiaProvider } from "@/lib/academiaStore";
import "./globals.css";

/**
 * Serifada de display, só para títulos de vitrine. Auto-hospedada pelo Next,
 * então não depende de rede em runtime nem carrega peso que não é usado.
 */
const fonteDisplay = Noto_Serif_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--fonte-display",
});

/**
 * Pincel, exclusiva do nome da marca no cabeçalho e no rodapé.
 *
 * Um único peso e um único uso: fonte de traço assim cansa em texto corrido e
 * perde legibilidade em tamanho pequeno. Aqui ela aparece em cinco lugares, e
 * sempre na mesma palavra.
 */
const fonteMarca = Nanum_Brush_Script({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--fonte-marca",
});

/**
 * Pincel japonês, padrão de todo kanji do site.
 *
 * A fonte da marca é coreana/latina e não tem glifos CJK — usá-la num kanji
 * cairia num fallback qualquer do sistema, diferente em cada máquina. Esta
 * cobre o japonês de verdade e dá o mesmo traço de pincel da marca.
 */
const fonteKanji = Yuji_Syuku({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--fonte-kanji",
});

export const metadata: Metadata = {
  title: {
    // Torakan (虎館, "casa do tigre") é a marca; o nome de registro da
    // academia acompanha no título para busca e reconhecimento formal.
    default: "Torakan — Academia Tigre de Karatê",
    template: "%s · Torakan",
  },
  description:
    "Academia Tigre de Karatê: dojo Shotokan e plataforma de estudos com história, técnicas, katas e fundamentos.",
  // Os ícones vêm de src/app/icon.png e src/app/apple-icon.png, que o Next
  // detecta e serve sozinho — por isso não há entrada `icons` aqui.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fonteDisplay.variable} ${fonteMarca.variable} ${fonteKanji.variable}`}
    >
      <body className="min-h-screen bg-canvas text-fg">
        <ThemeProvider>
          <AcademiaProvider>
            <ToastProvider>{children}</ToastProvider>
          </AcademiaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
