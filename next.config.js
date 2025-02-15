/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
  },
  // Optimize for client-side rendering
  reactStrictMode: true,
  swcMinify: true,
  // Handle cross-origin issues
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          }
        ],
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Add optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }

    // Handle server-side packages
    if (isServer) {
      config.externals = [...(config.externals || []), 'resend']
    }

    return config
  },
  // Add transpilePackages to ensure consistent React version
  transpilePackages: [
    'react-dropzone',
    'react-mathjax',
    'recharts',
    '@radix-ui/react-select',
    '@radix-ui/react-dialog',
    '@radix-ui/react-slot',
    '@vercel/analytics',
    '@vercel/speed-insights',
    'next-auth'
  ],
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    optimizeCss: true,
  },
  // Add static page configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  // Handle static error pages
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/_error',
        permanent: true,
      },
      {
        source: '/500',
        destination: '/_error',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig 