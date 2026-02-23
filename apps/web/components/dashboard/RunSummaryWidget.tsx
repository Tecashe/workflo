"use client";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { CheckCircle2, XCircle, Activity, TrendingUp } from "lucide-react";

function MiniBar({
    success,
    failure,
    maxVal,
}: {
    success: number;
    failure: number;
    maxVal: number;
}) {
    const total = success + failure;
    const h = maxVal > 0 ? Math.max(4, Math.round((total / maxVal) * 48)) : 4;
    const successPct = total > 0 ? (success / total) * 100 : 0;

    return (
        <div className="flex flex-col items-center justify-end gap-px" style={{ height: 52 }}>
            {total === 0 ? (
                <div className="w-2.5 rounded-sm bg-white/8" style={{ height: 4 }} />
            ) : (
                <div
                    className="w-2.5 rounded-sm overflow-hidden flex flex-col-reverse"
                    style={{ height: h }}
                >
                    <div className="bg-emerald-500/70" style={{ height: `${successPct}%` }} />
                    <div className="bg-red-500/60 flex-1" />
                </div>
            )}
        </div>
    );
}

export function RunSummaryWidget() {
    const { data, isLoading } = trpc.analytics.getRunSummary.useQuery(undefined, {
        staleTime: 2 * 60000,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="mb-6 rounded-xl border border-white/8 bg-white/[0.025] p-4 animate-pulse">
                <div className="h-4 w-40 rounded bg-white/10 mb-3" />
                <div className="flex gap-4">
                    <div className="h-8 w-16 rounded bg-white/10" />
                    <div className="h-8 w-16 rounded bg-white/10" />
                    <div className="h-8 w-16 rounded bg-white/10" />
                </div>
            </div>
        );
    }

    if (!data || data.totalRuns === 0) {
        return null; // Hide widget until there are runs
    }

    const maxBarVal = Math.max(1, ...data.last7Days.map((d) => d.success + d.failure));

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-white/50" />
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Run Summary</span>
                </div>
                <span className="text-[10px] text-white/30">Last 7 days</span>
            </div>

            <div className="flex items-end gap-5">
                {/* Stats column */}
                <div className="flex gap-5 shrink-0">
                    {/* Total runs */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/40">Total</span>
                        <span className="text-2xl font-bold text-white leading-none">{data.totalRuns}</span>
                        <span className="text-[10px] text-white/30">runs</span>
                    </div>

                    {/* Success */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500/70">Success</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-emerald-400 leading-none">{data.successCount}</span>
                            {data.successRate !== null && (
                                <span className="text-xs text-emerald-500/60">{data.successRate}%</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500/50" />
                            <span className="text-[10px] text-emerald-500/50">succeeded</span>
                        </div>
                    </div>

                    {/* Failures */}
                    {data.failureCount > 0 && (
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-red-500/70">Failed</span>
                            <span className="text-2xl font-bold text-red-400 leading-none">{data.failureCount}</span>
                            <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-500/50" />
                                <span className="text-[10px] text-red-500/50">failed</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sparkline bar chart */}
                <div className="flex-1 flex items-end justify-end gap-1 min-w-0">
                    {data.last7Days.map((day) => (
                        <div key={day.date} className="group relative flex flex-col items-center">
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="bg-black/80 rounded px-1.5 py-1 text-[10px] text-white whitespace-nowrap">
                                    {new Date(day.date + "T12:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}
                                    <br />
                                    <span className="text-emerald-400">{day.success}✓</span>{" "}
                                    {day.failure > 0 && <span className="text-red-400">{day.failure}✗</span>}
                                </div>
                            </div>
                            <MiniBar success={day.success} failure={day.failure} maxVal={maxBarVal} />
                        </div>
                    ))}
                </div>
            </div>

            {data.successRate !== null && data.successRate >= 90 && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400/60">
                    <TrendingUp className="h-3 w-3" />
                    <span>Workflows running smoothly — {data.successRate}% success rate</span>
                </div>
            )}
            {data.successRate !== null && data.successRate < 70 && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-red-400/60">
                    <XCircle className="h-3 w-3" />
                    <span>High failure rate ({100 - data.successRate}%) — check your workflow configurations</span>
                </div>
            )}
        </motion.div>
    );
}
