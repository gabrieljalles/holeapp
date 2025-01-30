/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_IMAGE_PROTOCOL || "https",
        port: process.env.NEXT_PUBLIC_IMAGE_PORT || "backend-holeapp-nest.onrender.com",
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOSTNAME,
        pathname: process.env.NEXT_PUBLIC_IMAGE_PATHNAME || "/spothole/uploads/**",
      },
    ],
  },
};

export default nextConfig;
