import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Superfícies e textos vêm de CSS variables trocadas pelo tema.
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        subtle: "rgb(var(--subtle) / <alpha-value>)",
        faixa: "rgb(var(--faixa) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",

        // Identidade fixa nos dois temas.
        accent: {
          DEFAULT: "#DC2626",
          hover: "#B91C1C",
          soft: "#EF4444",
        },
        status: {
          ok: "#16A34A",
          warn: "#D97706",
          bad: "#DC2626",
        },
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        md: "0.375rem",
        lg: "0.5rem",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      fontFamily: {
        // Serifada só para títulos de vitrine; a interface segue sem serifa.
        display: ["var(--fonte-display)", "Georgia", "serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
