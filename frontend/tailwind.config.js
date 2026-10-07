/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/hooks/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17221d",
        muted: "#64736b",
        paper: "#f6f8f5",
        accent: "#16784d"
      },
      boxShadow: {
        card: "0 10px 30px rgba(23, 34, 29, 0.06)"
      }
    }
  },
  plugins: []
};
