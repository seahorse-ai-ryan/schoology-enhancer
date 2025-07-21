import type {NextConfig} from 'next';

// This loads the .env file and sets the environment variables.
require('dotenv').config();

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    // For server-side use
    SCHOOLOGY_CLIENT_ID: process.env.SCHOOLOGY_CLIENT_ID,
    // For client-side use
    NEXT_PUBLIC_GREETING: process.env.NEXT_PUBLIC_GREETING,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SCHOOLOGY_CLIENT_ID: process.env.SCHOOLOGY_CLIENT_ID,
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
