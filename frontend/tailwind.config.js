/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ec111a',
          light: '#ff3d47',
          dark: '#c00e15',
        },
      },
    },
  },
  plugins: [],
}

