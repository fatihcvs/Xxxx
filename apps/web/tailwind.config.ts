import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Classic page-based look: warm parchment page, cream panels,
        // deep brown ink and a burgundy accent. All original values.
        soft: "#e9e4d3", // page background (parchment)
        panel: "#faf7ec", // panel / card background
        edge: "#c7bfa6", // panel borders
        ink: "#33302a", // body text (deep warm grey)
        brand: "#7d2f2f", // burgundy accent (links, buttons)
        brandDark: "#5f2424",
        band: "#2e2a24", // dark header band
        bandInk: "#efe9d6", // text on the dark band
        altRow: "#f1ecdb", // alternating table rows
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
