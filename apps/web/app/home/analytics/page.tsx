"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { EASE_OUT_QUAD } from "@/lib/animation/variants";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    Zap,
    BarChart2,
} from "lucide-react";

const BRAND = "#F04D26";
const EMERALD = "#34d399";
const RED = "#f87171";
const AMBER = "#fbbf24";
const MUTED = "rgba(255,255,255,0.06)";

const DAYS_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateMockWeekData() {
    return DAYS_LABELS.map((day) => ({
        day,
        success: Math.floor(Math.random() * 80 + 10),
        failure: Math.floor(Math.random() * 15),
        pending: Math.floor(Math.random() * 5),
    }));
}

const MOCK_WEEK_DATA = generateMockWeekData();

const MOCK_NODES = [
    { type: "HTTP Request", count: 312, color: BRAND },
    { type: "M-Pesa", count: 204, color: "#34d399" },
    { type: "WhatsApp", count: 178, color: "#60a5fa" },
    { type: "OpenAI", count: 143, color: "#a78bfa" },
    { type: "Email", count: 97, color: "#fb923c" },
    { type: "Discord", count: 61, color: "#818cf8" },
    { type: "Slack", count: 44, color: "#4ade80" },
];

const MOCK_TOP_WORKFLOWS = [
    { name: "M-Pesa Payment Confirmation", runs: 348, success: 341 },
    { name: "WhatsApp Receipt Sender", runs: 212, success: 208 },
    { name: "KRA Tax Receipt Generator", runs: 155, success: 148 },
    { name: "Daily Sales Report", runs: 90, success: 87 },
    { name: "Customer Onboarding", runs: 67, success: 65 },
];

const PIE_DATA = [
    { name: "Success", value: 72, color: EMERALD },
    { name: "Failed", value: 18, color: RED },
    { name: "Pending", value: 10, color: AMBER },
];

type CustomTooltipProps = {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
};
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 text-xs shadow-xl">
            <p className="mb-1.5 font-semibold text-white">{label}</p>
            {payload.map((entry) => (
                <p key={entry.name} style={{ color: entry.color }} className="capitalize">
                    {entry.name}: <span className="font-semibold">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    sub,
    color,
    delay = 0,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT_QUAD, delay }}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-4 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.24)]"
        >
            <div
                className="absolute inset-0 opacity-5"
                style={{ background: `radial-gradient(ellipse at top left, ${color}, transparent 70%)` }}
            />
            <div className="relative">
                <div
                    className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: `${color}18`, color }}
                >
                    {icon}
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/45">{label}</p>
                <p className="mt-0.5 text-2xl font-bold text-white">{value}</p>
                {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
            </div>
        </motion.div>
    );
}

export default function AnalyticsPage() {
    const [range] = useState<"7d" | "30d">("7d");
    const usage = trpc.execution.getUsage.useQuery(undefined, {
        staleTime: 30000,
        refetchOnWindowFocus: false,
    });

    const totalRuns = MOCK_WEEK_DATA.reduce((s, d) => s + d.success + d.failure + d.pending, 0);
    const totalSuccess = MOCK_WEEK_DATA.reduce((s, d) => s + d.success, 0);
    const totalFailed = MOCK_WEEK_DATA.reduce((s, d) => s + d.failure, 0);
    const successRate = totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0;
    const nodeMax = useMemo(() => Math.max(...MOCK_NODES.map((n) => n.count)), []);

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <motion.div
                className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUAD }}
            >
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        Workflow performance and usage insights
                    </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-1 text-sm">
                    {(["7d", "30d"] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => { }}
                            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${range === r
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white"
                                }`}
                        >
                            {r === "7d" ? "Last 7 days" : "Last 30 days"}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Quota Banner */}
            {usage.data && usage.data.monthlyRunLimit !== -1 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT_QUAD, delay: 0.05 }}
                    className="mb-5 rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-white">Monthly Execution Quota</span>
                        <span className="text-white/50">
                            {usage.data.runCount.toLocaleString()} / {usage.data.monthlyRunLimit.toLocaleString()} runs
                        </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                            className={`h-full rounded-full ${usage.data.runCount / usage.data.monthlyRunLimit > 0.8 ? "bg-amber-400" : "bg-[#F04D26]"
                                }`}
                            initial={{ width: 0 }}
                            animate={{
                                width: `${Math.min((usage.data.runCount / usage.data.monthlyRunLimit) * 100, 100)}%`,
                            }}
                            transition={{ duration: 0.6, ease: EASE_OUT_QUAD, delay: 0.3 }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-white/40">
                        {Math.round((usage.data.runCount / usage.data.monthlyRunLimit) * 100)}% of monthly limit used
                    </p>
                </motion.div>
            )}

            {/* Stat Cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                    icon={<Zap className="h-4 w-4" />}
                    label="Total Runs"
                    value={totalRuns.toLocaleString()}
                    sub="This week"
                    color={BRAND}
                    delay={0.08}
                />
                <StatCard
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Successful"
                    value={totalSuccess.toLocaleString()}
                    sub={`${successRate}% success rate`}
                    color={EMERALD}
                    delay={0.12}
                />
                <StatCard
                    icon={<XCircle className="h-4 w-4" />}
                    label="Failed"
                    value={totalFailed.toLocaleString()}
                    sub={`${100 - successRate}% failure rate`}
                    color={RED}
                    delay={0.16}
                />
                <StatCard
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Avg / Day"
                    value={Math.round(totalRuns / 7).toLocaleString()}
                    sub="Across all workflows"
                    color="#60a5fa"
                    delay={0.2}
                />
            </div>

            {/* Charts Row */}
            <div className="mb-6 grid gap-4 lg:grid-cols-3">
                {/* Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE_OUT_QUAD, delay: 0.18 }}
                    className="col-span-2 rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-4"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <BarChart2 className="h-4 w-4 text-white/40" />
                        <h2 className="text-sm font-semibold text-white">Daily Run Volume</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={MOCK_WEEK_DATA} barGap={3} barSize={10}>
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="success" fill={EMERALD} radius={[3, 3, 0, 0]} name="Success" />
                            <Bar dataKey="failure" fill={RED} radius={[3, 3, 0, 0]} name="Failed" />
                            <Bar dataKey="pending" fill={AMBER} radius={[3, 3, 0, 0]} name="Pending" />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex items-center gap-4 text-xs text-white/40">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Success</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Failed</span>
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" />Pending</span>
                    </div>
                </motion.div>

                {/* Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE_OUT_QUAD, delay: 0.22 }}
                    className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-4"
                >
                    <h2 className="mb-4 text-sm font-semibold text-white">Outcome Breakdown</h2>
                    <div className="flex items-center justify-center">
                        <PieChart width={140} height={140}>
                            <Pie
                                data={PIE_DATA}
                                cx={65}
                                cy={65}
                                innerRadius={42}
                                outerRadius={60}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {PIE_DATA.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </div>
                    <div className="mt-3 space-y-2">
                        {PIE_DATA.map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-white/60">
                                    <span
                                        className="h-2 w-2 shrink-0 rounded-full"
                                        style={{ background: entry.color }}
                                    />
                                    {entry.name}
                                </span>
                                <span className="font-semibold text-white">{entry.value}%</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Workflows */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE_OUT_QUAD, delay: 0.26 }}
                    className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-4"
                >
                    <h2 className="mb-4 text-sm font-semibold text-white">Top Workflows by Runs</h2>
                    <div className="space-y-3">
                        {MOCK_TOP_WORKFLOWS.map((wf, i) => {
                            const rate = Math.round((wf.success / wf.runs) * 100);
                            return (
                                <div key={wf.name}>
                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-xs text-white/70">
                                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white/40 border border-white/10">
                                                {i + 1}
                                            </span>
                                            <span className="truncate max-w-[180px]">{wf.name}</span>
                                        </span>
                                        <span className="shrink-0 text-xs font-semibold text-white/80">{wf.runs}</span>
                                    </div>
                                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                                        <motion.div
                                            className="h-full rounded-full bg-[#F04D26]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${rate}%` }}
                                            transition={{ duration: 0.5, delay: 0.3 + i * 0.05, ease: EASE_OUT_QUAD }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Node Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: EASE_OUT_QUAD, delay: 0.3 }}
                    className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.005))] p-4"
                >
                    <h2 className="mb-4 text-sm font-semibold text-white">Node Type Usage</h2>
                    <div className="space-y-3">
                        {MOCK_NODES.map((node, i) => (
                            <div key={node.type}>
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs text-white/70">{node.type}</span>
                                    <span className="text-xs font-semibold text-white/80">{node.count}</span>
                                </div>
                                <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ background: node.color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(node.count / nodeMax) * 100}%` }}
                                        transition={{ duration: 0.5, delay: 0.3 + i * 0.04, ease: EASE_OUT_QUAD }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Note */}
            <motion.p
                className="mt-6 text-center text-xs text-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <Clock className="mr-1 inline h-3 w-3" />
                Chart data is illustrative — live analytics coming in the next release.
            </motion.p>
        </div>
    );
}
