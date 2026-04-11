import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        neon:   '#00D4FF',
        purple: '#7C3AED',
        green:  '#10B981',
        amber:  '#F59E0B',
        bg:     '#05080f',
        bg2:    '#0a0f1e',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
      },
    },
  },
  plugins: [],
};
export default config;
