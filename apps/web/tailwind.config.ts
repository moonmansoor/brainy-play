import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        card: "var(--card)",
        ink: "var(--ink)",
        accent: "var(--accent)",
        accentWarm: "var(--accent-warm)",
        sky: "var(--sky)",
        mint: "var(--mint)"
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      boxShadow: {
        playful: "0 18px 60px rgba(9, 20, 35, 0.12)"
      },
      backgroundImage: {
        confetti:
          "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.7) 0 2px, transparent 2px), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.55) 0 3px, transparent 3px), radial-gradient(circle at 50% 90%, rgba(255,255,255,0.5) 0 2px, transparent 2px)"
      }
    }
  },
  plugins: []
};

export default config;
