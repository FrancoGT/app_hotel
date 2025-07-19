/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#9F836A",
        background: "#fdfaf7",
        foreground: "#2c2c2c",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
      },
    },
  },
  plugins: [],
};