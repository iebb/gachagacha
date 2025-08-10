/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef7ee",
          100: "#fdedd6",
          200: "#fad7ac",
          300: "#f6bb77",
          400: "#f1953d",
          500: "#ed7a1a",
          600: "#de5f0f",
          700: "#b8470e",
          800: "#933a12",
          900: "#773112",
        },
      },
    },
  },
  plugins: [],
};
