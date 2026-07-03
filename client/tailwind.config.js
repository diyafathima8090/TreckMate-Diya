/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        trek: {
          dark: '#091515', // Deep slate/forest green base
          card: '#112220', // Forest green card background
          border: '#1a332d', // Lighter forest green border
          green: '#064e3b', // Deep forest green accent
          'green-light': '#047857', // Lighter green
          orange: '#ff6b35', // Sunset orange accent
          'orange-hover': '#e85b25', // Sunset orange hover
          brown: '#ff6b35', // Legacy brown mapping to sunset orange
          'brown-hover': '#e85b25', // Legacy brown mapping to sunset orange
        }
      }
    },
  },
  plugins: [],
}

