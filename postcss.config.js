module.exports = {
  plugins: {
    // Tailwind v4 moved the PostCSS plugin to @tailwindcss/postcss
    // Replace 'tailwindcss' with the new package to avoid build errors.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
