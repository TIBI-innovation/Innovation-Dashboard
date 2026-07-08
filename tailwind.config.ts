import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e9f4fc",
          100: "#c9e3f7",
          200: "#9dcdf1",
          300: "#63afe9",
          400: "#3698e2",
          500: "#1e84d2",
          600: "#1b75bc",
          700: "#165f98",
          800: "#114974",
          900: "#0b3250",
        },
      },
    },
  },
  plugins: [],
};

export default config;
