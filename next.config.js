/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during build
  },
  compiler: {
    // Use SWC for compilation
    styledComponents: true,
  },
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
      },
      {
        source: '/tesseract/:path*',
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
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          }
        ],
      }
    ]
  },
  webpack: (config, { isServer }) => {
    // Add node_modules to module resolution paths
    config.resolve.modules = ['node_modules', ...config.resolve.modules]

    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve('./node_modules/react/jsx-dev-runtime'),
    }

    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
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
  ]
}

module.exports = nextConfig 