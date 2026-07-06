/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class", // enable class-based dark mode
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}", // include everything under src
      "./app/**/*.{js,ts,jsx,tsx}",     // if you also have app at project root
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  