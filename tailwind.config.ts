import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // BSD TYPING Design Tokens
        surface: "#11131c",
        "surface-container": "#1d1f29",
        "surface-container-high": "#282933",
        "surface-container-highest": "#32343e",
        primary: "#cdbdff",
        "primary-container": "#5c1fde",
        secondary: "#bdc2ff",
        tertiary: "#fabd00",
        "on-surface": "#e1e1ef",
        "on-surface-variant": "#cbc3d9",
        outline: "#958da2",
        "outline-variant": "#494456",
        error: "#ffb4ab",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
