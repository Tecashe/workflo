import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { isWebOnlyRuntimeMode } from "@repo/shared/automation-flags";
if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

function getServerBaseURL() {
    if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const isProduction = process.env.NODE_ENV === "production";
const hasRedisConfig = Boolean(process.env.REDIS_URL?.trim() || process.env.UPSTASH_REDIS_URL?.trim() || process.env.REDIS_HOST?.trim());
const useRedisSecondaryStorage = !isWebOnlyRuntimeMode() && hasRedisConfig;

const socialProviders: {
    google?: {
        clientId: string;
        clientSecret: string;
        prompt?: "select_account" | "consent" | "login" | "none" | "select_account consent";
    };
} = {};

if (googleClientId && googleClientSecret) {
    socialProviders.google = {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        prompt: "select_account",
    };
}
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        sendResetPassword: async ({ user, url }) => {
            if (!process.env.RESEND_API_KEY) {
                console.info(`[dev] Password reset URL for ${user.email}: ${url}`);
                return;
            }
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || 'noreply@fynt.app',
                    to: user.email,
                    subject: 'Reset your Floe password',
                    html: `<p>Hi ${user.name || 'there'},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${url}" style="color:#F04D26">Reset Password</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
                }),
            }).catch((err) => console.error('[auth] Resend password reset failed:', err));
        },
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            if (!process.env.RESEND_API_KEY) {
                console.info(`[dev] Email verification URL for ${user.email}: ${url}`);
                return;
            }
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || 'noreply@fynt.app',
                    to: user.email,
                    subject: 'Verify your Floe email address',
                    html: `<p>Welcome to Floe, ${user.name || 'there'}!</p><p>Please verify your email address to get started.</p><p><a href="${url}" style="color:#F04D26">Verify Email</a></p>`,
                }),
            }).catch((err) => console.error('[auth] Resend verification failed:', err));
        },
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: false,
        },
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailVerification: async ({ user, newEmail, url }) => {
                if (!process.env.RESEND_API_KEY) {
                    console.info(`[dev] Email change URL for ${user.email} -> ${newEmail}: ${url}`);
                    return;
                }
                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: process.env.EMAIL_FROM || 'noreply@fynt.app',
                        to: newEmail,
                        subject: 'Confirm your new Floe email address',
                        html: `<p>Hi ${user.name || 'there'},</p><p>Click below to confirm your new email address: <strong>${newEmail}</strong></p><p><a href="${url}" style="color:#F04D26">Confirm Email Change</a></p>`,
                    }),
                }).catch((err) => console.error('[auth] Resend email change failed:', err));
            },
        },
        deleteUser: {
            enabled: true,
        },
    },
    rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        storage: useRedisSecondaryStorage ? "secondary-storage" : "memory",
    },
    secondaryStorage: useRedisSecondaryStorage
        ? {
            get: async (key: string) => {
                const { redis, withRedisFallback } = await import("@repo/shared/redis");
                return withRedisFallback("auth:secondary-storage:get", async () => redis.get(key), async () => null);
            },
            set: async (key: string, value: string, ttl?: number) => {
                const { redis, withRedisFallback } = await import("@repo/shared/redis");
                await withRedisFallback("auth:secondary-storage:set", async () => {
                    if (ttl) {
                        await redis.set(key, value, "EX", ttl);
                    }
                    else {
                        await redis.set(key, value);
                    }
                }, async () => undefined);
            },
            delete: async (key: string) => {
                const { redis, withRedisFallback } = await import("@repo/shared/redis");
                await withRedisFallback("auth:secondary-storage:delete", async () => {
                    await redis.del(key);
                }, async () => undefined);
            },
        }
        : undefined,
    advanced: {
        useSecureCookies: isProduction,
        crossSubDomainCookies: {
            enabled: false,
        },
    },
    socialProviders,
    trustedOrigins: [
        getServerBaseURL(),
        process.env.BETTER_AUTH_URL || "",
        process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
        process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
        process.env.NGROK_URL || "",
    ].filter(Boolean) as string[],
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: getServerBaseURL(),
});
