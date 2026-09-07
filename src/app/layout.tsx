import type { Metadata } from "next";
import { Noto_Serif_Display } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Portal Shotokan — Academia e Plataforma de Estudos",
    template: "%s · Portal Shotokan",
  },
  description:
    "Academia de Karatê Shotokan e plataforma de estudos: história, técnicas, katas e fundamentos.",
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
      className={fonteDisplay.variable}
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
