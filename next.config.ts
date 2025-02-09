import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint errors during build
  },
};

export default nextConfig;
