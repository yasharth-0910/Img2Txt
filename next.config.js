/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint during build
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
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom')
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
    '@radix-ui/react-slot'
  ]
}

module.exports = nextConfig 