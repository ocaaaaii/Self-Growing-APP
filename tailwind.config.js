/** @type {import('tailwindcss').Config} */

// Colours reference CSS variables (RGB triplets) so the whole app
// can be re-themed at runtime by setting [data-theme] on <html>.
// See app/globals.css for the theme definitions.
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          bg: v("--c-cream-bg"),
          paper: v("--c-cream-paper"),
          card: v("--c-cream-card"),
        },
        cocoa: {
          DEFAULT: v("--c-cocoa"),
          deep: v("--c-cocoa-deep"),
          soft: v("--c-cocoa-soft"),
        },
        milktea: {
          DEFAULT: v("--c-milktea"),
          soft: v("--c-milktea-soft"),
        },
        beige: v("--c-beige"),
        cheek: v("--c-cheek"),
        dusty: v("--c-dusty"),
        sage: v("--c-sage"),
        sky: v("--c-sky"),
        butter: v("--c-butter"),
        line: v("--c-line"),
      },
      fontFamily: {
        sans: ["Quicksand", "Noto Sans TC", "-apple-system", "sans-serif"],
        hand: ["Caveat", "cursive"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(40, 30, 22, 0.08)",
        lift: "0 6px 24px rgba(40, 30, 22, 0.15)",
      },
      borderRadius: {
        xl2: "22px",
        xl3: "28px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-4px) rotate(1deg)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.3) translateY(20px)", opacity: "0" },
          "60%": { transform: "scale(1.15) translateY(-8px)", opacity: "1" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        floatUp: {
          "0%": { transform: "translateY(0) scale(0.5)", opacity: "0" },
          "20%": { transform: "translateY(-10px) scale(1.1)", opacity: "1" },
          "100%": { transform: "translateY(-60px) scale(1)", opacity: "0" },
        },
        peek: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-2px) rotate(-5deg)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease",
        slideUp: "slideUp 0.35s cubic-bezier(0.34, 1.2, 0.4, 1)",
        floaty: "floaty 3s ease-in-out infinite",
        bounceIn: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        floatUp: "floatUp 1.2s ease-out forwards",
        peek: "peek 4s ease-in-out infinite",
        pulseSoft: "pulseSoft 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
