/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'mashroky-production.up.railway.app',
        'www.mashrok.online',
        'mashrok.online',
      ],
    },
  },
};

export default nextConfig;
