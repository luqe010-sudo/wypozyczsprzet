/** @type {import('tailwindcss').Config} */

// Safety orange: a single accent for the whole product. Shade 600 keeps 5:1 contrast with white text.
const brand = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#ea580c',
  600: '#c2410c',
  700: '#9a3412',
  800: '#7c2d12',
  900: '#5f2410',
  950: '#431407',
};

module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand,
        // Older screens still use blue-*/indigo-* classes; both resolve to the brand colour.
        blue: brand,
        indigo: brand,
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-light': 'var(--primary-light)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        card: 'var(--card)',
        border: 'var(--border)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
