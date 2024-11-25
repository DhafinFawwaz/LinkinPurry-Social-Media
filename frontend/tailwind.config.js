/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background_grey: "#f3f2ee",
        blue_primary: "#0b66c3",
        blue_hover: "#004182",
        black_primary: "#434343",
        white_hover: "#f3f2ee"
      },
      transitionTimingFunction: {
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
      }
    },
  },
  plugins: [],
}

