/** @type {import('tailwindcss').Config} */

const brand = {
  50: '#fffbeb',
  100: '#fff1bf',
  200: '#ffe489',
  300: '#ffd44d',
  400: '#ffc400',
  500: '#966600',
  600: '#805700',
  700: '#684700',
  800: '#513700',
  900: '#3d2900',
  950: '#261a00',
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
        'market-navy': '#111d2c',
        'market-yellow': '#ffc400',
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
