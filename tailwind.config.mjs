/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        porcelain: '#F5F2ED',
        carbon: '#453F3A',
        aluminum: '#B8AEA1',
        gold: {
          DEFAULT: '#FFB668',
          light: '#FDCE7E',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(0.75rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out forwards',
        'fade-in': 'fade-in 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
};
