import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        yellow: '#F3C734',
        blue: '#2F63FA',
        green: '#63DE77',
        grey: '#BABABA',
        red: '#ff4444',
        paper: '#f0e8d0',
        ink: '#1a1208',
        brand: {
          yellow: '#F3C734',
          blue: '#2F63FA',
          green: '#63DE77',
          grey: '#BABABA',
          red: '#ff4444',
          paper: '#f0e8d0',
          ink: '#1a1208',
        },
      },
      fontFamily: {
        vt323: ['var(--font-vt323)', 'monospace'],
        'black-han': ['var(--font-black-han)', 'sans-serif'],
        sixtyfour: ['var(--font-sixtyfour)', 'monospace'],
        'special-elite': ['var(--font-special-elite)', 'serif'],
        marker: ['var(--font-permanent-marker)', 'cursive'],
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'blink-slow': 'blink 2s step-end infinite',
        'marquee': 'marquee 30s linear infinite',
        'coin-fall': 'coinFall 0.8s ease-in forwards',
        shake: 'shake 0.5s ease-in-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        coinFall: {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'rotate(-0.8deg)' },
          '25%': { transform: 'rotate(-2deg)' },
          '75%': { transform: 'rotate(0.5deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
