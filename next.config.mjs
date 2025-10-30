/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone', // or 'export' if fully static
  trailingSlash: true,
  images: {
    domains: ['your-s3-bucket-name.s3.amazonaws.com'],
  },
  // If using API routes
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

export default nextConfig
