/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",       // ajuste esses caminhos conforme seu projeto
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
