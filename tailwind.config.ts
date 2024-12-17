// tailwind.config.ts
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
        primary: '#D8382B',    // Primary color (e.g., buttons, highlights)
        accent: '#FCA605',     // Accent color (e.g., labels, tooltips)
        secondary: '#EADED1',  // Secondary color (e.g., text)
        dark: '#171717',       // Dark background
        card: '#2D3748',       // Card background
        'gradient-gold': 'from-yellow-400 to-yellow-600',
        'gradient-silver': 'from-gray-400 to-gray-600',
        'gradient-bronze': 'from-orange-500 to-yellow-700',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'], // Custom font family
      },
      boxShadow: {
        'card': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'card-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
