/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,tsx}"], 
  theme: {
    extend: {      
      screens: {
        '4k': '2000px',
      },
      keyframes: {
        spinDualRing: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        spinDualRing: "spinDualRing 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};
