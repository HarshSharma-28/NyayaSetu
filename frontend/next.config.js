/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'xbcgxlghpqlomgwfusnt.supabase.co',
      'lh3.googleusercontent.com',
    ],
    // Explicit image error handling — no unoptimized
    unoptimized: false,
  },
  // Strip console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  // Strict mode
  reactStrictMode: true,
}

module.exports = nextConfig
