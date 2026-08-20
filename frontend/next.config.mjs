/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_IMAGE_PROTOCOL || "https",
        hostname:
          process.env.NEXT_PUBLIC_IMAGE_HOSTNAME ||
          "localhost",
        pathname:
          process.env.NEXT_PUBLIC_IMAGE_PATHNAME || "/spothole/uploads**",
      },
      {
        hostname: "utfs.io",
        protocol: "https",
        pathname: "/**"
      },
    ],
    
  },
};

export default nextConfig;
