/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  theme: {
  extend: {
    colors: {
      decaBlue: '#0077C8',
      decaDark: '#0032A0',
      decaGray: '#F5F5F5',
      decaText: '#333333',
    },
    fontFamily: {
      sans: ['"Open Sans"', 'sans-serif'],
    },
  },
}

};
