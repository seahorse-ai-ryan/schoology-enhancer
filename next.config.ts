import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_GREETING: process.env.NEXT_PUBLIC_GREETING,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SCHOOLOGY_CLIENT_ID: process.env.SCHOOLOGY_CLIENT_ID,
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
