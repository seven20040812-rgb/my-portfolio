import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#070912",
        "ground-2": "#0C101C",
        "ground-3": "#121828",
        ink: "#EEF1F6",
        "ink-muted": "#8B95A7",
        "ink-faint": "#5A6478",
        line: "rgba(255,255,255,0.08)",
        accent: "#F2C879",
        "accent-dim": "#C9A25E",
        star: "#CFE0FF",
        danger: "#E5484D",
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        content: "1200px",
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
    },
  },
  plugins: [],
} satisfies Config;
