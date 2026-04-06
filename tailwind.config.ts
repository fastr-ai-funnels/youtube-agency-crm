import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode surface tokens
        surface: "#ffffff",
        "surface-2": "#f1f5f9",
        "surface-3": "#e2e8f0",
        // Blue accent
        accent: "#2563eb",
        "accent-light": "#3b82f6",
        "accent-muted": "#dbeafe",
        // Text
        "text-1": "#0f172a",
        "text-2": "#475569",
        "text-3": "#94a3b8",
      },
    },
  },
  plugins: [],
};

export default config;
