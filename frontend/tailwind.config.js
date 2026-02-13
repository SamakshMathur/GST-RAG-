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
        "cinema-gold": "#FFD700",
        "cyber-cyan": "#00F0FF",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(to right, #003B59, #0B7350)",
        "spotlight-radial": "radial-gradient(circle at center, rgba(11, 115, 80, 0.15) 0%, rgba(2, 2, 2, 0) 70%)",
        "gold-glow": "radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, rgba(2, 2, 2, 0) 60%)",
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"], // Primary UI Font (Cinematic)
        mono: ["Space Grotesk", "monospace"], // Technical Headers
        pixel: ['"Silkscreen"', '"Press Start 2P"', "monospace"], // Pixel / OffBit Font
        brand: ['"Orbitron"', "sans-serif"], // Logo Font placeholder
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
