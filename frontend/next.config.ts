import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "127.0.0.1",
        protocol: "http",
      },
      {
        protocol: "http",
        hostname: "photofinder.phigalaxy.com",
        pathname: "/**", // or "/**" if you want to be more permissive
      }
    ],
  },
};

export default nextConfig;