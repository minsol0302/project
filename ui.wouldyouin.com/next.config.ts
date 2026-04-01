/**
 * next.config.ts
 * Performance-optimized: tree-shaking + modern browsers
 */
import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname),
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "api.wouldyouin.com" },
      { protocol: "http", hostname: "localhost" },
      // AWS S3 도메인
      { protocol: "https", hostname: "jimin260307-vding.s3.ap-northeast-2.amazonaws.com" },
    ],
  },

  // Tree-shake large icon/date libraries (reduces unused JS ~14-24 KiB)
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default nextConfig;
