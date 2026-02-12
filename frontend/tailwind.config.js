/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "sentinel-blue": "#003B59",
        "sentinel-green": "#0B7350",
        "sentinel-dark": "#020202",
        "sentinel-card": "#0a1620",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(to right, #003B59, #0B7350)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // Primary UI Font
        pixel: ['"Silkscreen"', '"Press Start 2P"', "monospace"], // Pixel / OffBit Font
        brand: ['"Orbitron"', "sans-serif"], // Logo Font placeholder
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
