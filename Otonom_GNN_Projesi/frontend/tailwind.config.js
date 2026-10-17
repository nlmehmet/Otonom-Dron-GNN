/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1116',
        panel: '#111c24',
        line: '#253943',
        cyan: '#5de1ff',
        lime: '#a6e86d',
        alert: '#ff6f61',
        amber: '#ffd166',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      boxShadow: {
        cyan: '0 0 24px rgba(93, 225, 255, .22)',
      },
    },
  },
  plugins: [],
}
