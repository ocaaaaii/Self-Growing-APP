/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Oat & cocoa palette — muted journal aesthetic
        cream: {
          bg: "#E8DCC8",      // oat
          paper: "#F0E5D0",   // lighter oat
          card: "#FAF4E8",    // cream white
        },
        cocoa: {
          DEFAULT: "#8B5E3F", // milk chocolate
          deep: "#5C4332",    // dark cocoa
          soft: "#A47854",    // lighter chocolate
        },
        milktea: {
          DEFAULT: "#B89478", // warm taupe
          soft: "#D8CFC2",    // taupe grey
        },
        beige: "#DDD0B8",     // warm oat beige
        cheek: "#E2A8A0",     // muted rose
        dusty: "#D4A89E",     // dusty rose
        sage: "#B5BFA0",      // muted sage
        sky: "#B8C5C9",       // muted blue-grey
        butter: "#E8D8A8",    // oat yellow
        line: "#D8CFC2",
      },
      fontFamily: {
        sans: ["Quicksand", "Noto Sans TC", "-apple-system", "sans-serif"],
        hand: ["Caveat", "cursive"],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(92, 67, 50, 0.08)",
        lift: "0 6px 24px rgba(92, 67, 50, 0.15)",
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
      },
      animation: {
        fadeIn: "fadeIn 0.35s ease",
        slideUp: "slideUp 0.35s cubic-bezier(0.34, 1.2, 0.4, 1)",
        floaty: "floaty 3s ease-in-out infinite",
        bounceIn: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        floatUp: "floatUp 1.2s ease-out forwards",
        peek: "peek 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
