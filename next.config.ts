import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fixes junction-point creation error on Windows paths with spaces
  outputFileTracingRoot: path.resolve(__dirname),

  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "pg"],

  // Transpile ESM-only packages so webpack can bundle them correctly
  transpilePackages: [
    "next-auth",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
  ],

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
