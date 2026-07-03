import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#ffffff",
        ink: "#1e2429",
        // Classic link blue (brand doubles as the link/action colour).
        brand: "#09639a",
        brandDark: "#0078a3",
        soft: "#eef1f3", // glossy header light stop
        accent: "#ffcc00", // selection / highlight
        alert: "#cc2200", // warnings / attention
      },
      fontFamily: {
        game: ["Verdana", '"Lucida Grande"', '"Lucida Sans Unicode"', "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
