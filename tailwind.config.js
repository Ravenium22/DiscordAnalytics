// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}', // Adjust according to your project structure
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1d1d1d',
        primary: '#3490dc',
        accent: '#ffed4a',
        secondary: '#e5e7eb',
        card: '#2d2d2d',
        // Add other custom colors if needed
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
