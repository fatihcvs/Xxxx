import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#ffffff",
        ink: "#2b3038",
        brand: "#5b6ea8", // calm slate-blue accent (easy on the eyes)
        brandDark: "#465684",
        soft: "#eaeef3", // soft blue-grey background
      },
    },
  },
  plugins: [],
} satisfies Config;
