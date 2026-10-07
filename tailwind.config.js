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
        primary: { DEFAULT: "#01758F", dark: "#016177", foreground: "#FFFFFF" },
        accent: "#BFE3EC",
        // shadcn/ui tokens (zinc palette)
        background: "#FFFFFF",
        foreground: "#09090B",
        card: { DEFAULT: "#FFFFFF", foreground: "#09090B" },
        muted: { DEFAULT: "#F4F4F5", foreground: "#71717A" },
        border: "#E4E4E7",
        input: "#E4E4E7",
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