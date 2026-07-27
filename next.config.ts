import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Scraped listings hotlink company logos from the source job board, so
    // the host set is open-ended by design.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
