/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        gold: {
          300: "#f0d080",
          400: "#e6c44a",
          500: "#c9a84c",
          600: "#a8872e",
        },
        navy: {
          800: "#1a1a2e",
          900: "#0f0f1e",
        },
      },
    },
  },
  plugins: [],
};