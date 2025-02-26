/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Désactiver pour éviter les doubles rendus
  webpack: (config) => {
    // Enable Buffer polyfill for the XRPL library
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve("buffer/"),
    };
    return config;
  },

  experimental: {
    // Cette option peut aider à réduire les erreurs d'hydratation
    strictNextjsHydrationErrors: false,
  },
};

module.exports = nextConfig;
