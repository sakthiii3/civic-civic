import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "better-sqlite3"],
  },
};

export default nextConfig;
