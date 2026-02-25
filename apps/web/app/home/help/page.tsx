"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT_QUAD } from "@/lib/animation/variants";
import { NODE_REGISTRY } from "@repo/shared";
import { CATEGORY_LABELS } from "@repo/shared";
import {
    Search,
    BookOpen,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Zap,
    Globe,
    GitBranch,
    Layers,
    HelpCircle,
    ArrowRight,
} from "lucide-react";

const QUICK_STARTS = [
    {
        icon: "🇰🇪",
        title: "Connect M-Pesa in 5 minutes",
        description: "Configure Safaricom Daraja API and accept STK Push payments.",
        time: "5 min",
        color: "#34d399",
    },
    {
        icon: "💬",
        title: "Send WhatsApp Notifications",
        description: "Send automated WhatsApp messages when events occur in your workflow.",
        time: "7 min",
        color: "#60a5fa",
    },
    {
        icon: "🤖",
        title: "Build an AI-powered workflow",
        description: "Use OpenAI or Gemini to classify, generate text, or summarize data.",
        time: "10 min",
        color: "#a78bfa",
    },
    {
        icon: "⏰",
        title: "Schedule a recurring job",
        description: "Use the Cron Trigger to run workflows on a fixed schedule automatically.",
        time: "3 min",
        color: "#F04D26",
    },
];

const FAQS = [
    {
        q: "What is a workflow?",
        a: "A workflow is a series of automated steps (nodes) connected in a sequence. It starts with a trigger event and can include integrations, logic, and utility steps. You build workflows visually using the canvas editor.",
    },
    {
        q: "What are credentials and why do I need them?",
        a: "Credentials are securely stored API keys and tokens for third-party services like M-Pesa, OpenAI, or Slack. Nodes that connect to external services require credentials to authenticate your requests.",
    },
    {
        q: "What triggers can start a workflow?",
        a: "Workflows can be triggered manually (one-click run), via a webhook (HTTP POST from an external service), or on a cron schedule (e.g., every day at 9 AM).",
    },
    {
        q: "How does billing work?",
        a: "The Free plan includes 100 workflow runs per month. The Pro plan ($19/mo) includes 2,000 runs and the Business plan ($79/mo) includes 20,000 runs. A 'run' is one complete execution of a workflow from start to finish.",
    },
    {
        q: "Are my credentials secure?",
        a: "Yes. All credential values are encrypted at rest using AES-256 encryption before being stored. We never expose raw credential values in the UI after they are saved.",
    },
    {
        q: "Can I retry a failed workflow run?",
        a: "Yes. Navigate to the Executions page, find the failed run, and click on it to view the detail panel. You can then trigger a re-run directly from the workflow canvas.",
    },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    triggers: Zap,
    integrations: Globe,
    logic: GitBranch,
    utilities: Layers,
};

export default function HelpPage() {
    const [search, setSearch] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState<"quickstart" | "nodes" | "faq">("quickstart");

    const filteredNodes = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return NODE_REGISTRY;
        return NODE_REGISTRY.filter(
            (n) =>
                n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)
        );
    }, [search]);

    const nodesByCategory = useMemo(() => {
        const grouped: Record<string, typeof NODE_REGISTRY> = {};
        for (const node of filteredNodes) {
            if (!grouped[node.category]) grouped[node.category] = [];
            grouped[node.category]!.push(node);
        }
        return grouped;
    }, [filteredNodes]);

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUAD }}
            >
                <h1 className="text-2xl font-bold text-foreground">Help & Docs</h1>
                <p className="text-sm text-muted-foreground">
                    Guides, node reference, and frequently asked questions
                </p>
            </motion.div>

            {/* Section Tabs */}
            <motion.div
                className="mb-5 flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1 w-fit"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUAD, delay: 0.05 }}
            >
                {(["quickstart", "nodes", "faq"] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setActiveSection(s)}
                        className={`relative rounded px-4 py-1.5 text-sm font-medium transition-colors ${activeSection === s ? "text-white" : "text-white/45 hover:text-white"
                            }`}
                    >
                        {activeSection === s && (
                            <motion.div
                                layoutId="help-tab"
                                className="absolute inset-0 rounded bg-white/10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative">
                            {s === "quickstart" ? "Quick Start" : s === "nodes" ? "Node Reference" : "FAQ"}
                        </span>
                    </button>
                ))}
            </motion.div>

            <AnimatePresence mode="wait">
                {activeSection === "quickstart" && (
                    <motion.div
                        key="quickstart"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: EASE_OUT_QUAD }}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            {QUICK_STARTS.map((qs, i) => (
                                <motion.div
                                    key={qs.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.18, ease: EASE_OUT_QUAD, delay: i * 0.04 }}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-4 transition-[border-color,box-shadow] duration-300 hover:border-white/20 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)]"
                                >
                                    <div
                                        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                        style={{
                                            background: `radial-gradient(ellipse at top left, ${qs.color}08, transparent 70%)`,
                                        }}
                                    />
                                    <div className="relative flex items-start gap-3">
                                        <span className="text-2xl">{qs.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="mb-1 text-sm font-semibold text-white">{qs.title}</p>
                                            <p className="text-xs text-white/50 leading-relaxed">{qs.description}</p>
                                            <div className="mt-3 flex items-center gap-2">
                                                <span
                                                    className="rounded px-2 py-0.5 text-[10px] font-semibold"
                                                    style={{ background: `${qs.color}18`, color: qs.color }}
                                                >
                                                    {qs.time}
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] text-white/30 group-hover:text-white/60 transition-colors">
                                                    Read guide <ArrowRight className="h-3 w-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Community Links */}
                        <motion.div
                            className="mt-5 grid gap-3 sm:grid-cols-2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: EASE_OUT_QUAD, delay: 0.2 }}
                        >
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-4 w-4 text-white/50" />
                                    <span className="text-sm text-white/70">Documentation</span>
                                </div>
                                <ExternalLink className="h-3.5 w-3.5 text-white/25" />
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageCircle className="h-4 w-4 text-white/50" />
                                    <span className="text-sm text-white/70">Community Forum</span>
                                </div>
                                <ExternalLink className="h-3.5 w-3.5 text-white/25" />
                            </a>
                        </motion.div>
                    </motion.div>
                )}

                {activeSection === "nodes" && (
                    <motion.div
                        key="nodes"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: EASE_OUT_QUAD }}
                    >
                        {/* Search */}
                        <div className="relative mb-5 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search nodes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20 transition-colors"
                            />
                        </div>

                        {filteredNodes.length === 0 ? (
                            <p className="py-8 text-center text-sm text-white/40">No nodes match your search.</p>
                        ) : (
                            <div className="space-y-5">
                                {(Object.keys(nodesByCategory) as (keyof typeof CATEGORY_LABELS)[]).map((cat) => {
                                    const CatIcon = CATEGORY_ICONS[cat] ?? HelpCircle;
                                    return (
                                        <div key={cat}>
                                            <div className="mb-2.5 flex items-center gap-2">
                                                <CatIcon className="h-3.5 w-3.5 text-white/40" />
                                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/45">
                                                    {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                                                </h3>
                                            </div>
                                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                {nodesByCategory[cat]!.map((node) => (
                                                    <div
                                                        key={node.type}
                                                        className="rounded-lg border border-white/8 bg-white/[0.02] p-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
                                                    >
                                                        <p className="mb-0.5 text-sm font-semibold text-white">{node.label}</p>
                                                        <p className="text-[11px] text-white/45 leading-relaxed">{node.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeSection === "faq" && (
                    <motion.div
                        key="faq"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: EASE_OUT_QUAD }}
                        className="max-w-2xl space-y-2"
                    >
                        {FAQS.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15, ease: EASE_OUT_QUAD, delay: i * 0.03 }}
                                className="overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))]"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
                                >
                                    <span className="text-sm font-medium text-white">{faq.q}</span>
                                    {openFaq === i ? (
                                        <ChevronUp className="h-4 w-4 shrink-0 text-white/40" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 shrink-0 text-white/40" />
                                    )}
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2, ease: EASE_OUT_QUAD }}
                                        >
                                            <div className="border-t border-white/8 px-4 py-3">
                                                <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
