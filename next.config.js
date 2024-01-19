/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL || 'http://localhost:8000',
  },
};

module.exports = {
  ...nextConfig,
  webpack: (config, { isServer }) => {
    // Adicione a importação da biblioteca csrf aqui
    config.resolve.alias['csrf'] = require.resolve('csrf');

    return config;
  },
};
