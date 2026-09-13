/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#15130f',
        surface: '#211d17',
        'surface-alt': '#2a251d',
        foreground: '#f3ede0',
        muted: '#a89f8a',
        border: '#3a352b',
        gold: '#c9a227',
        crimson: '#c1484a',
        'crimson-dark': '#a53b3d',
        teal: '#4a8b8f',
        green: '#5fa876',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
