/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    // Disable webpack cache
    config.cache = false;
    return config;
  },
  // Disable Next.js cache
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 0,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 0,
  },
};

module.exports = nextConfig; 