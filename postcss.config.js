module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

// Tailwind v4 PostCSS plugin shape
try {
  const tailwindPostcss = require('@tailwindcss/postcss');
  module.exports = {
    plugins: [tailwindPostcss(), require('autoprefixer')],
  };
} catch (e) {
  // fallback to the object plugin for older tailwind versions
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
}

// Note: Tailwind v4 may require using the separate @tailwindcss/postcss plugin.
// If build fails after this change, we'll install or adapt the plugin accordingly.

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
