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
    if (!isServer) {
      // Client-side specific config
      config.resolve.alias = {
        ...config.resolve.alias,
        'react': require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react-dom/client': require.resolve('react-dom/client')
      }
    } else {
      // Server-side specific config
      config.resolve.alias = {
        ...config.resolve.alias,
        'react': require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react-dom/server': require.resolve('react-dom/server'),
        'react-dom/server.browser': require.resolve('react-dom/server.browser')
      }
    }

    // Common config
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime')
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
    '@vercel/speed-insights'
  ]
}

module.exports = nextConfig 