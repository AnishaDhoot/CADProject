/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // Change to false to catch TypeScript errors
  },
  images: {
    unoptimized: true, // Required for Amplify
    // domains: ['your-s3-bucket-name.s3.amazonaws.com'],
  },
  trailingSlash: false, // Change to false (true can cause issues)
  // Remove the 'output: standalone' line entirely
  // Remove the experimental section unless you specifically need it
}

export default nextConfig