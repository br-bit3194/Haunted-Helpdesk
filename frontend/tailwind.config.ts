import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-void': '#0a0a0f',
        'bg-crypt': '#1a1a2e',
        'bg-tombstone': '#16213e',
        'pumpkin-orange': '#ff6b35',
        'blood-red': '#8b0000',
        'spectral-green': '#39ff14',
        'phantom-purple': '#9d4edd',
        'bone-white': '#f8f8ff',
        'cobweb-gray': '#4a4a4a',
      },
      fontFamily: {
        creepster: ['Creepster', 'cursive'],
      },
      backgroundImage: {
        'gradient-haunted': 'linear-gradient(to bottom right, #0a0a0f, #1a1a2e, #16213e)',
        'gradient-blood-moon': 'linear-gradient(135deg, #8b0000, #ff6b35)',
        'gradient-ectoplasm': 'linear-gradient(135deg, #39ff14, #9d4edd)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        rattle: 'rattle 0.5s ease-in-out infinite',
        cackle: 'cackle 2s ease-in-out infinite',
        bite: 'bite 1s ease-in-out infinite',
        'hover-menace': 'hover-menace 3s ease-in-out infinite',
        unwrap: 'unwrap 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        rattle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        cackle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.05) rotate(-2deg)' },
          '75%': { transform: 'scale(1.05) rotate(2deg)' },
        },
        bite: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'hover-menace': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-15px) scale(1.05)' },
        },
        unwrap: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
