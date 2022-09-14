const util = require("util");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: "loose",
  },

  webpack: (config, ctx) => {
    config.experiments.asyncWebAssembly = true;
    config.module.rules.push({
      test: [/\.csv$/],
      type: "asset/source",
    });
    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;
