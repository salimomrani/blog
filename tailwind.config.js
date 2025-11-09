/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#64748B',
        accent: '#F59E0B',
        background: '#F9FAFB',
        text: '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
