/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forest: {
          950: '#07100b',
          900: '#0b1612',
          850: '#0e1e17',
          800: '#13271f',
          750: '#193429',
          700: '#214335',
        },
        sage: {
          50: '#f4f7f5',
          100: '#e6eee8',
          200: '#d1ded4',
          300: '#b1c6b6',
          400: '#8ba792',
          500: '#688870',
          600: '#4e6d55',
          700: '#3f5744',
          800: '#354638',
          900: '#2d3b30',
          950: '#162018',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(18, 33, 24, 0.04), 0 1px 2px 0 rgba(18, 33, 24, 0.02)',
        'card-clean': '0 1px 3px 0 rgba(18, 33, 24, 0.03), 0 4px 14px -2px rgba(18, 33, 24, 0.03)',
        'card-elevated': '0 10px 25px -5px rgba(18, 33, 24, 0.06), 0 0 0 1px rgba(18, 33, 24, 0.04)',
      },
    },
  },
  plugins: [],
}
