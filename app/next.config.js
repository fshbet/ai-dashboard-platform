/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Keep these packages server-side only (they use native bindings)
  serverExternalPackages: ["better-sqlite3", "papaparse", "xlsx"],
  experimental: {
    optimizePackageImports: ["echarts"],
  },
  transpilePackages: ["echarts-for-react", "echarts", "zrender"],
};

module.exports = nextConfig;
