/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_IMAGE_PROTOCOL || "https",
        port: process.env.NEXT_PUBLIC_IMAGE_PORT,
        hostname:
          process.env.NEXT_PUBLIC_IMAGE_HOSTNAME ||
          "w0gk4c4s48skwwssgkgksggc.82.29.58.15.sslip.io",
        pathname:
          process.env.NEXT_PUBLIC_IMAGE_PATHNAME || "/spothole/uploads/**",
      },
      {
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
