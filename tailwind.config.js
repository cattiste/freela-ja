/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Remova os requires e use apenas os nomes dos plugins
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}