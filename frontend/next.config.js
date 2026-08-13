/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["echarts", "apache-echarts"],
  },
  transpilePackages: ["echarts-for-react", "echarts", "zrender"],
};
module.exports = nextConfig;
