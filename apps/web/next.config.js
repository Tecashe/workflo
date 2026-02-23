const nextConfig = {
    reactStrictMode: true,
    distDir: ".next",
    transpilePackages: ["@repo/prisma", "@repo/shared"],
    serverExternalPackages: ["ioredis", "bullmq"],
    typedRoutes: true,
    experimental: {
        turbo: {
            root: "../..",
        },
    },
};
export default nextConfig;
