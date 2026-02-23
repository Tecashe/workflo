"use client";
import { useState } from "react";
import { Check, Zap, Building2, Sparkles, ArrowRight, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const PLANS = [
    {
        key: "free" as const,
        name: "Free",
        price: "$0",
        period: "forever",
        description: "Perfect for getting started",
        color: "border-white/10",
        badge: null,
        icon: <Sparkles className="h-5 w-5 text-white/60" />,
        features: [
            "100 workflow runs / month",
            "3 active workflows",
            "All node types (M-Pesa, WhatsApp, etc.)",
            "Webhook & cron triggers",
            "Community support",
        ],
        cta: "Current Plan",
        ctaDisabled: true,
    },
    {
        key: "pro" as const,
        name: "Pro",
        price: "$19",
        period: "per month",
        description: "For growing businesses",
        color: "border-[#F04D26]",
        badge: "Most Popular",
        icon: <Zap className="h-5 w-5 text-[#F04D26]" />,
        features: [
            "2,000 workflow runs / month",
            "Unlimited active workflows",
            "M-Pesa, WhatsApp, Africa's Talking",
            "Priority queue execution",
            "Email support",
            "Run history & logs (90 days)",
        ],
        cta: "Upgrade to Pro",
        ctaDisabled: false,
    },
    {
        key: "business" as const,
        name: "Business",
        price: "$79",
        period: "per month",
        description: "For teams & high-volume operations",
        color: "border-white/20",
        badge: null,
        icon: <Building2 className="h-5 w-5 text-white/80" />,
        features: [
            "20,000 workflow runs / month",
            "Unlimited everything",
            "KRA ETR compliance automation",
            "Custom webhook domains",
            "Priority support + SLA",
            "Run history (unlimited)",
            "Team member access (coming soon)",
        ],
        cta: "Upgrade to Business",
        ctaDisabled: false,
    },
];

export default function UpgradePage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const { data: subscription } = trpc.billing.getSubscription.useQuery();
    const createCheckout = trpc.billing.createCheckoutSession.useMutation();
    const createPortal = trpc.billing.createPortalSession.useMutation();

    const currentPlan = subscription?.plan ?? "free";
    const hasSubscription = currentPlan !== "free";

    const handleUpgrade = async (plan: "pro" | "business") => {
        setLoadingPlan(plan);
        try {
            const result = await createCheckout.mutateAsync({ plan });
            if (result.url) {
                window.location.href = result.url;
            }
        } catch (err) {
            console.error("Checkout failed:", err);
            alert("Could not start checkout. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleManageBilling = async () => {
        setLoadingPlan("portal");
        try {
            const result = await createPortal.mutateAsync();
            if (result.url) {
                window.location.href = result.url;
            }
        } catch (err) {
            console.error("Portal failed:", err);
            alert("Could not open billing portal. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#1A1A1B] p-6 md:p-10">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-[#F04D26]/10 border border-[#F04D26]/20 rounded-full px-4 py-1.5 mb-6">
                    <Sparkles className="h-4 w-4 text-[#F04D26]" />
                    <span className="text-sm text-[#F04D26] font-medium">Simple, transparent pricing</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Upgrade your workflow
                </h1>
                <p className="text-white/50 text-base max-w-lg mx-auto">
                    Automate M-Pesa payments, WhatsApp receipts, and KRA compliance — scale without limits.
                </p>
            </div>

            {/* Manage billing banner for existing subscribers */}
            {hasSubscription && (
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-[#2D2D2E] border border-[#444] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-white/60" />
                            <div>
                                <p className="text-white text-sm font-medium capitalize">
                                    You&apos;re on the <span className="text-[#F04D26]">{currentPlan}</span> plan
                                </p>
                                <p className="text-white/40 text-xs">Manage invoices, change plan, or cancel</p>
                            </div>
                        </div>
                        <button
                            onClick={handleManageBilling}
                            disabled={loadingPlan === "portal"}
                            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[#444] text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            {loadingPlan === "portal" ? "Opening..." : "Manage Billing"}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Pricing cards */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
                {PLANS.map((plan) => {
                    const isCurrentPlan = currentPlan === plan.key;
                    const isLoading = loadingPlan === plan.key;

                    return (
                        <div
                            key={plan.key}
                            className={`relative flex flex-col rounded-2xl border bg-[#222223] p-6 transition-all ${plan.color} ${plan.key === "pro" ? "ring-1 ring-[#F04D26]/30" : ""}`}
                        >
                            {/* Badge */}
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-[#F04D26] text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            {/* Icon + Name */}
                            <div className="flex items-center gap-2 mb-4">
                                {plan.icon}
                                <span className="text-white font-semibold">{plan.name}</span>
                                {isCurrentPlan && (
                                    <span className="ml-auto text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mb-1">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                <span className="text-white/40 text-sm ml-2">{plan.period}</span>
                            </div>
                            <p className="text-white/40 text-xs mb-5">{plan.description}</p>

                            {/* Features */}
                            <ul className="space-y-2.5 mb-6 flex-1">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                                        <Check className="h-4 w-4 text-[#F04D26] mt-0.5 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <button
                                disabled={isCurrentPlan || plan.ctaDisabled || isLoading}
                                onClick={() => {
                                    if (plan.key !== "free") handleUpgrade(plan.key);
                                }}
                                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${isCurrentPlan || plan.ctaDisabled
                                        ? "bg-white/5 text-white/30 cursor-not-allowed"
                                        : plan.key === "pro"
                                            ? "bg-[#F04D26] hover:bg-[#e04420] text-white"
                                            : "bg-white/10 hover:bg-white/15 text-white border border-white/20"
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Redirecting...
                                    </>
                                ) : (
                                    <>
                                        {isCurrentPlan ? "Current Plan" : plan.cta}
                                        {!isCurrentPlan && !plan.ctaDisabled && <ArrowRight className="h-4 w-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Footer note */}
            <p className="text-center text-white/30 text-xs mt-10">
                All plans include access to M-Pesa, Africa&apos;s Talking, and WhatsApp Business integrations.
                Prices in USD. Cancel anytime.
            </p>
        </div>
    );
}
