import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    // The moment the static HTML was rendered: the sale prices hydrate against
    // it before the browser switches to its own clock (src/lib/useSale.ts).
    BUILD_TIME: String(Date.now()),
  },
};

export default nextConfig;
