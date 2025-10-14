module.exports = {
  plugins: [
    // Load the Tailwind PostCSS plugin explicitly. Tailwind v4
    // exposes a separate PostCSS plugin package: @tailwindcss/postcss
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};
