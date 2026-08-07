/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sky: { DEFAULT: "#3FA9DA", deep: "#1C7FB5", tint: "#EAF6FD" },
        crimson: { DEFAULT: "#D93A3A", deep: "#B32828" },
        ink: "#122536",
        line: "#D8E9F2"
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    }
  },
  plugins: []
};
