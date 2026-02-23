import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../trpc";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Lazy Stripe client — tree-shakes from the bundle if key not set
async function getStripe() {
    if (!STRIPE_SECRET_KEY) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment variables.",
        });
    }
    const Stripe = (await import("stripe")).default;
    return new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-01-27.acacia" });
}

// ------------------------------------------------------------------
// Plan definitions — must match products/prices created in Stripe
// ------------------------------------------------------------------
export const PLAN_PRICE_IDS: Record<string, string> = {
    pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro_placeholder",
    business: process.env.STRIPE_BUSINESS_PRICE_ID || "price_business_placeholder",
};

const getSubscription = protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { stripeCustomerId: true, stripeSubscriptionId: true, stripeSubscriptionStatus: true, stripePlan: true },
    });

    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

    return {
        customerId: user.stripeCustomerId ?? null,
        subscriptionId: user.stripeSubscriptionId ?? null,
        status: user.stripeSubscriptionStatus ?? "none",
        plan: user.stripePlan ?? "free",
    };
});

const createCheckoutSession = protectedProcedure
    .input(z.object({ plan: z.enum(["pro", "business"]) }))
    .mutation(async ({ ctx, input }) => {
        const stripe = await getStripe();

        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.userId },
            select: { email: true, stripeCustomerId: true },
        });
        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        const priceId = PLAN_PRICE_IDS[input.plan];
        if (!priceId) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Unknown plan: ${input.plan}` });
        }

        const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: user.stripeCustomerId ?? undefined,
            customer_email: user.stripeCustomerId ? undefined : user.email ?? undefined,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${baseUrl}/home?upgraded=1`,
            cancel_url: `${baseUrl}/home/upgrade?cancelled=1`,
            metadata: { userId: ctx.userId, plan: input.plan },
            subscription_data: {
                metadata: { userId: ctx.userId, plan: input.plan },
            },
        });

        return { url: session.url };
    });

const createPortalSession = protectedProcedure.mutation(async ({ ctx }) => {
    const stripe = await getStripe();

    const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No billing account found. Please upgrade first." });
    }

    const baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/home/upgrade`,
    });

    return { url: session.url };
});

export const billingRouter = router({
    getSubscription,
    createCheckoutSession,
    createPortalSession,
});
