import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        vidhara: {
          bg: "#FFF1F1",
          lavender: "#E9B3FB",
          purple: "#6F00FF",
          deep: "#3B0270",
          text: "#241A33",
          "muted-text": "#837C8D",
          border: "#F0E6F3",
          surface: "#FAF7FC",
          white: "#FFFFFF",
          success: "#16865C",
          warning: "#D99516",
          error: "#D84B66",
          "purple-light": "#9D4EFF",
          "lavender-light": "#F7E5FC",
          "lavender-subtle": "#FAF1FD",
          "card-hover": "#F9F2FB",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        "cta-gradient": "linear-gradient(135deg, #6F00FF 0%, #3B0270 100%)",
        "cta-hover": "linear-gradient(135deg, #7C1AFF 0%, #470685 100%)",
        "lavender-gradient": "linear-gradient(135deg, #FFF1F1 0%, #E9B3FB 100%)",
        "purple-highlight": "linear-gradient(135deg, #6F00FF 0%, #9D4EFF 100%)",
        "purple-subtle": "linear-gradient(135deg, #FAF7FC 0%, #F5E8FB 100%)",
        "dark-sidebar": "linear-gradient(180deg, #181024 0%, #10081B 100%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        "vidhara-card": "0 8px 30px -4px rgba(59, 2, 112, 0.05), 0 4px 12px -2px rgba(111, 0, 255, 0.03)",
        "vidhara-card-hover": "0 14px 40px -4px rgba(59, 2, 112, 0.09), 0 8px 20px -2px rgba(111, 0, 255, 0.07)",
        "vidhara-cta": "0 10px 25px -3px rgba(111, 0, 255, 0.35)",
        "vidhara-glass": "0 8px 32px 0 rgba(111, 0, 255, 0.07)",
        "vidhara-subtle": "0 2px 10px rgba(36, 26, 51, 0.03)",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-subtle": "pulse-subtle 3s infinite ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

