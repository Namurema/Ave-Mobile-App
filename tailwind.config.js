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
        primary: "#007C7C",
        accent: "#C2FFFF",
        navy: {
          800: "#1a1a2e",
          900: "#0f0f1e",
        },
      },
    },
  },
  plugins: [],
};