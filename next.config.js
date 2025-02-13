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
    // Ensure proper resolution of React and JSX runtime
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
      'react': require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
      'react-dom/server': require.resolve('react-dom/server')
    }

    // Add fallback for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      'react-dom/server': require.resolve('react-dom/server'),
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
    '@react-email/render',
    'resend'
  ]
}

module.exports = nextConfig 