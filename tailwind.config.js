/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Marque : violet (aligné sur les variables --primary-* de globals.css)
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        ink: {
          DEFAULT: '#17132b',
          soft: '#4a4563',
          muted: '#6b6685',
        },
        paper: {
          DEFAULT: '#fbf9f4',
          deep: '#f3efe6',
        },
        sun: '#ffc93c',
        mint: '#12b76a',
        coral: '#ff6b57',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23,19,43,0.04), 0 8px 24px -8px rgba(23,19,43,0.10)',
        lift: '0 2px 4px rgba(23,19,43,0.04), 0 24px 48px -16px rgba(76,29,149,0.22)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-6px)' },
          '40%,80%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        shake: 'shake 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
