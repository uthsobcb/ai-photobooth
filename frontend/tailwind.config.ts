import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1130",
        mist: "#ECEEF8",
        booth: { DEFAULT: "#2330D8", dark: "#1A25B0" },
        focus: "#FFD21F",
        alert: "#D12B3F",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
