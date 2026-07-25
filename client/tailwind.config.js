/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border-color)",
        input: "var(--border-color)",
        ring: "var(--color-primary)",
        background: "var(--bg-primary)",
        foreground: "var(--text-primary)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--text-primary)",
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--bg-tertiary)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--bg-tertiary)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--text-primary)",
        },
        card: {
          DEFAULT: "var(--bg-secondary)",
          foreground: "var(--text-primary)",
        },
        "bg-base": "#FFFFFF",
        "bg-subtle": "#F8F9FB",
        "accent-liquid-blue": "#4F46E5",
        "accent-liquid-blue-dark": "#4338CA",
        "text-primary": "#09090B",
        "text-secondary": "#52525B",
        "border-subtle": "rgba(0, 0, 0, 0.06)",
        "border-glass": "rgba(255, 255, 255, 0.5)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
