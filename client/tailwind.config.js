
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
          dark: '#091515', 
          card: '#112220', 
          border: '#1a332d', 
          green: '#064e3b', 
          'green-light': '#047857', 
          orange: '#ff6b35', 
          'orange-hover': '#e85b25', 
          brown: '#ff6b35', 
          'brown-hover': '#e85b25', 
        }
      }
    },
  },
  plugins: [],
}

