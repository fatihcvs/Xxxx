import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#ffffff",
        ink: "#1f2430",
        brand: "#7c3aed",
        brandDark: "#5b21b6",
        soft: "#f4f2f8",
      },
    },
  },
  plugins: [],
} satisfies Config;
