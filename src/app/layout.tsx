import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AcademiaProvider } from "@/lib/academiaStore";
import "./globals.css";

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas text-fg">
        <ThemeProvider>
          <AcademiaProvider>{children}</AcademiaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
