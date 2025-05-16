import type { NextConfig } from "next";

const BACKEND_API_INTERNAL_URL = process.env.INTERNAL_BACKEND_URL || 'http://api:3000'; // <--- 이 부분을 다시 확인!

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.watchOptions = {
      poll: 500,
      aggregateTimeout: 300,
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/api/nearby/restaurant',
        destination: `${BACKEND_API_INTERNAL_URL}/restaurant/nearby`,
      },
      {
        source: '/api/restaurant/search',
        destination: `${BACKEND_API_INTERNAL_URL}/restaurant/search`,
      },
      {
        source: '/api/restaurant/search_food',
        destination: `${BACKEND_API_INTERNAL_URL}/restaurant/search_food`,
      },
    ];
  },
}

export default nextConfig;
