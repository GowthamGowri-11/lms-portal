import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "pg"],
  transpilePackages: ["next-auth"],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@monaco-editor/react",
      "react-markdown",
    ],
  },
};

export default nextConfig;
