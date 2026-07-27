import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray pnpm-workspace.yaml makes root inference guess wrong; pin it.
  turbopack: { root: __dirname },
  images: {
    // Scraped listings hotlink company logos from the source job board, so
    // the host set is open-ended by design.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
