import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#ffffff",
        ink: "#111111",
        // Classic link blue (brand doubles as the link/action colour).
        brand: "#09639a",
        brandDark: "#0078a3",
        soft: "#eeeeee", // light grey used for header bands and boxes
        accent: "#ffcc00", // selection / highlight
        alert: "#f58400", // warnings / attention
      },
      fontFamily: {
        game: ['"Lucida Grande"', '"Lucida Sans Unicode"', "Verdana", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
