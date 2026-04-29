/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-hover': '#1d4ed8',
        'primary-light': '#eff6ff',
        background: '#F9FAFB',
        foreground: '#111827',
        muted: '#64748b',
        'muted-foreground': '#94a3b8',
        card: '#FFFFFF',
        border: '#e2e8f0',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
