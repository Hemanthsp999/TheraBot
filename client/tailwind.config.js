module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Ensures Tailwind scans your files
  safelist: ["animate-fadeIn"], // Ensure animation class is kept
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 1s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [
        require("tailwindcss-animate"),
    ],
};
