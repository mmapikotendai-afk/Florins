import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "32kb" } },
  images: { formats: ["image/avif", "image/webp"], remotePatterns: [] },
};

export default nextConfig;
