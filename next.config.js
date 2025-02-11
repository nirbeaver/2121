/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // For Google profile pictures
      // Add any other domains you're loading images from
    ],
    unoptimized: true // Add this for Netlify deployment
  },
}

module.exports = nextConfig 