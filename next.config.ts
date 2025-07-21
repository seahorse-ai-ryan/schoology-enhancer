import type {NextConfig} from 'next';
require('dotenv').config({ path: './.env' });


const nextConfig: NextConfig = {
  /* config options here */
  env: {
    SCHOOLOGY_CLIENT_ID: process.env.SCHOOLOGY_CLIENT_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
