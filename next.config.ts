import type { NextConfig } from "next";
import { weddingContent } from "./lib/wedding-content";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/wedding/registry",
        destination: weddingContent.registry.url,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
