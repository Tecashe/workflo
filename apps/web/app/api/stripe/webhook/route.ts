import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Plan → run limits (runs per month)
const PLAN_LIMITS: Record<string, number> = {
    free: 100,
    pro: 2000,
    business: 20000,
};

async function getStripe() {
    const Stripe = (await import("stripe")).default;
    return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-02-24.acacia" });
}

export async function POST(req: NextRequest) {
    if (!STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
        return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const stripe = await getStripe();
    let event: import("stripe").Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[stripe/webhook] Signature verification failed:", message);
        return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as import("stripe").Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan ?? "pro";
                if (userId && session.customer) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            stripeCustomerId: String(session.customer),
                            stripeSubscriptionId: String(session.subscription),
                            stripeSubscriptionStatus: "active",
                            stripePlan: plan,
                            plan: plan,
                            monthlyRunLimit: PLAN_LIMITS[plan] ?? 2000,
                        },
                    });
                }
                break;
            }

            case "customer.subscription.updated": {
                const sub = event.data.object as import("stripe").Stripe.Subscription;
                const userId = sub.metadata?.userId;
                const plan = sub.metadata?.plan ?? "pro";
                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            stripeSubscriptionId: sub.id,
                            stripeSubscriptionStatus: sub.status,
                            stripePlan: plan,
                            ...(sub.status === "active" ? {
                                plan: plan,
                                monthlyRunLimit: PLAN_LIMITS[plan] ?? 2000,
                            } : {}),
                        },
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const sub = event.data.object as import("stripe").Stripe.Subscription;
                const userId = sub.metadata?.userId;
                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            stripeSubscriptionStatus: "cancelled",
                            stripePlan: "free",
                            plan: "free",
                            monthlyRunLimit: PLAN_LIMITS.free,
                        },
                    });
                }
                break;
            }

            default:
                // Unhandled event type — log and ignore
                console.log(`[stripe/webhook] Unhandled event: ${event.type}`);
        }
    } catch (err) {
        console.error("[stripe/webhook] Database update error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
