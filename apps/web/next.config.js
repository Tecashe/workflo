const nextConfig = {
    reactStrictMode: true,
    distDir: ".next",
    transpilePackages: ["@repo/prisma", "@repo/shared"],
    serverExternalPackages: ["ioredis", "bullmq"],
    typedRoutes: true,
    turbopack: {
        root: "../..",
    },
};
export default nextConfig;
