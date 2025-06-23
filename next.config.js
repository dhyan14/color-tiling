/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false
  }
}

module.exports = nextConfig 