/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // User requested palette:
        // #0F3040 - Deep Nile Teal
        // #464858 - Cool Dusk Slate
        // #A56F63 - Terracotta Earth
        // #D99B7F - Warm Apricot Sand
        brand: {
          50: '#fbf7f4',
          100: '#f4eae4',
          200: '#ebd6cb',
          300: '#e3bead',
          400: '#D99B7F', // User palette: Warm Apricot Sand
          500: '#c58467',
          600: '#A56F63', // User palette: Terracotta
          700: '#8b584d',
          800: '#6f423a',
          900: '#464858', // User palette: Cool Dusk Slate
          950: '#0F3040', // User palette: Deep Nile Teal
        },
        nile: {
          950: '#07161f',
          900: '#0F3040', // User palette
          850: '#14384a',
          800: '#1a4459',
          700: '#255b75',
          600: '#327393',
          500: '#428eb3',
        },
        dusk: {
          950: '#17181f',
          900: '#262732',
          850: '#363745',
          800: '#464858', // User palette
          700: '#5a5c6e',
          600: '#727488',
        },
        terracotta: {
          DEFAULT: '#A56F63', // User palette
          light: '#ba8175',
          dark: '#87564b',
        },
        sand: {
          DEFAULT: '#D99B7F', // User palette
          light: '#e5b098',
          dark: '#c38366',
        },
        slate: {
          800: '#233745',
          850: '#172733',
          900: '#0F2633', // Anchored to #0F3040
          950: '#07151D', // Deep background
        },
        status: {
          safe: '#2dd4bf',       // Vibrant Teal (harmonizes with #0F3040)
          attention: '#D99B7F',  // Warm Sand (User palette)
          expired: '#ef4444',    // Rose Red
          processing: '#A56F63', // Terracotta (User palette)
          review: '#D99B7F',     // Sand highlight
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['Noto Sans Arabic', 'Cairo', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
