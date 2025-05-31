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
      {
        source: '/api/restaurant/search_category',
        destination: `${BACKEND_API_INTERNAL_URL}/restaurant/search/category`,
      },
      {
        source: '/api/recommend',
        destination: `${BACKEND_API_INTERNAL_URL}/recommend`,
      },
      {
        source: '/api/nearby/randompick',
        destination: `${BACKEND_API_INTERNAL_URL}/restaurant/randompick`,
      },
      {
        source: '/api/auth/register-check-id',
        destination: `${BACKEND_API_INTERNAL_URL}/auth/register-check-id`,
      },
      {
        source: '/api/auth/register',
        destination: `${BACKEND_API_INTERNAL_URL}/auth/register`,
      },
      {
        source: '/api/auth/login',
        destination: `${BACKEND_API_INTERNAL_URL}/auth/login`,
      }
    ];
  },
}

export default nextConfig;
