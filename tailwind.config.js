/** @type {import('tailwindcss').Config} */
module.exports = {
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#267122",
          secondary: "#0C3E4D",
          accent: "#3697C7",
          neutral: "#191D24",
          "base-100": "#F8F8F8",
          info: "#B1BCE5",
          success: "#ACDEAA",
          warning: "#F4DEAB",
          error: "#F4A5AC",
        },
      },
    ],
  },
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
