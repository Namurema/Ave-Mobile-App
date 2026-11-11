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
        // light: teal for text on the dark background
        primary: { DEFAULT: "#01758F", dark: "#016177", light: "#5FC4DB", foreground: "#FFFFFF" },
        // Dark teal for highlights; light teal (accent-light) for small text on photos
        accent: { DEFAULT: "#1D4F5C", light: "#BFE3EC" },
        // shadcn/ui tokens, dark (charcoal)
        background: "#171717",
        foreground: "#FAFAFA",
        card: { DEFAULT: "#222222", foreground: "#FAFAFA" },
        muted: { DEFAULT: "#2A2A2A", foreground: "#A3A3A3" },
        border: "#303030",
        input: "#3A3A3A",
        ring: "#01758F",
        destructive: { DEFAULT: "#DC2626", foreground: "#FFFFFF" },
        navy: {
          800: "#1a1a2e",
          900: "#0f0f1e",
        },
      },
    },
  },
  plugins: [],
};