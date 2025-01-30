/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_IMAGE_PROTOCOL || "https",
        port: process.env.NEXT_PUBLIC_IMAGE_PORT,
        hostname: process.env.NEXT_PUBLIC_IMAGE_HOSTNAME || "backend-holeapp-nest.onrender.com",
        pathname: process.env.NEXT_PUBLIC_IMAGE_PATHNAME || "/spothole/uploads/**",
      },
    ],
  },
};

export default nextConfig;
