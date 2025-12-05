/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Disable eslint during build for Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
