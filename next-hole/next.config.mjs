/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_IMAGE_PROTOCOL || "https",
        port: process.env.NEXT_PUBLIC_IMAGE_PORT,
        hostname:
          process.env.NEXT_PUBLIC_IMAGE_HOSTNAME ||
          "localhost",
        pathname:
          process.env.NEXT_PUBLIC_IMAGE_PATHNAME || "/spothole/**",
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
