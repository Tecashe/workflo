"use client";
import { Suspense, useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { trpc } from "@/lib/trpc/client";
import { useExecutionSocket } from "@/lib/executions/useExecutionSocket";
import { EASE_OUT_QUAD } from "@/lib/animation/variants";
import { useSearchParams } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
    Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Success: "bg-green-500/20 text-green-400 border-green-500/30",
    Failure: "bg-red-500/20 text-red-400 border-red-500/30",
};

const STATUS_DOT: Record<string, string> = {
    Pending: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]",
    Success: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]",
    Failure: "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]",
};

const NODE_STATUS_COLORS: Record<string, string> = {
    Pending: "text-yellow-400",
    Running: "text-yellow-400",
    Success: "text-green-400",
    Failed: "text-red-400",
    Skipped: "text-gray-400",
};

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || "bg-gray-400"}`} />
            {status}
        </span>
    );
}

function formatDuration(start: Date, end?: Date | null, nowMs: number = Date.now()): string {
    const ms = Math.max(0, (end ? new Date(end).getTime() : nowMs) - new Date(start).getTime());
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function timeAgo(date: Date, nowMs: number = Date.now()): string {
    const seconds = Math.floor((nowMs - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function formatDateGroup(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type RunItem = {
    id: string;
    status: string;
    createdAt: Date;
    finishedAt: Date | null;
    workflow: { id: string; title: string };
    nodeRuns: { id: string; status: string }[];
};

function ExecutionDetailSheet({
    runId,
    open,
    onOpenChange,
    nowMs,
}: {
    runId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    nowMs: number;
}) {
    const { data: run, isLoading } = trpc.execution.getById.useQuery(
        { runId: runId! },
        { enabled: !!runId, refetchOnWindowFocus: false }
    );
    const utils = trpc.useUtils();
    const [liveStatuses, setLiveStatuses] = useState<Record<string, string>>({});
    const [workflowStatus, setWorkflowStatus] = useState<string | null>(null);
    const lastNodeRefetchAtRef = useRef(0);

    useExecutionSocket({
        runId: runId ?? null,
        enabled: Boolean(runId && run?.status === "Pending"),
        onEvent: (data) => {
            if (data.type === "node") {
                setLiveStatuses((prev) => ({ ...prev, [data.nodeId]: data.status }));
                if (runId) {
                    const now = Date.now();
                    if (now - lastNodeRefetchAtRef.current > 450) {
                        lastNodeRefetchAtRef.current = now;
                        void utils.execution.getById.invalidate({ runId });
                    }
                }
            }
            if (data.type === "workflow") {
                setWorkflowStatus(data.status);
                if ((data.status === "Success" || data.status === "Failure") && runId) {
                    void utils.execution.getById.invalidate({ runId });
                }
            }
        },
    });

    useEffect(() => {
        setLiveStatuses({});
        setWorkflowStatus(null);
    }, [runId]);

    const effectiveStatus = workflowStatus || run?.status || "Pending";

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="sm:max-w-md bg-[#1a1a1a] border-[#333] p-0 overflow-y-auto rounded-l-xl outline-none focus:outline-none"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {isLoading || !run ? (
                    <>
                        <SheetHeader className="p-4 pb-0">
                            <SheetTitle className="text-white text-base">Loading...</SheetTitle>
                        </SheetHeader>
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-48 bg-white/5" />
                            <Skeleton className="h-4 w-32 bg-white/5" />
                            <div className="space-y-3 mt-6">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <SheetHeader className="p-4 pb-0">
                            <SheetTitle className="text-white text-base">{run.workflow.title}</SheetTitle>
                            <SheetDescription asChild>
                                <div className="flex items-center gap-2 mt-1">
                                    <StatusBadge status={effectiveStatus} />
                                    <span className="text-white/40 text-xs">{formatDuration(run.createdAt, run.finishedAt, nowMs)}</span>
                                    <span className="text-white/40 text-xs">{timeAgo(run.createdAt, nowMs)}</span>
                                </div>
                            </SheetDescription>
                        </SheetHeader>
                        <div className="border-t border-[#333] p-4">
                            <h3 className="text-sm font-medium text-white mb-3">Node Runs</h3>
                            <div className="space-y-2">
                                {run.nodeRuns.length === 0 ? (
                                    <p className="text-white/40 text-xs">No nodes executed yet.</p>
                                ) : (
                                    <AnimatePresence initial={false}>
                                        {run.nodeRuns.map((nr, index) => {
                                            const liveStatus = liveStatuses[nr.nodeId] || nr.status;
                                            return (
                                                <motion.div
                                                    key={nr.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2, delay: index * 0.04 }}
                                                    className="rounded-lg border border-[#333] bg-[#141414] p-3"
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-white/70 font-medium">{nr.nodeType}</span>
                                                        <span className={`text-xs font-medium ${NODE_STATUS_COLORS[liveStatus] || "text-white/50"}`}>
                                                            {liveStatus}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-white/40 space-y-0.5">
                                                        <div>ID: {nr.nodeId.slice(0, 8)}...</div>
                                                        {nr.startedAt && <div>Duration: {formatDuration(nr.startedAt, nr.completedAt, nowMs)}</div>}
                                                        {nr.error && (
                                                            <div className="text-red-400 mt-1 p-2 bg-red-500/10 rounded border border-red-500/20">
                                                                <div className="font-medium mb-1">Error:</div>
                                                                <div className="font-mono text-[10px] break-words">{nr.error}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}

type StatusFilter = "Pending" | "Success" | "Failure" | undefined;

function ActivityFeedContent() {
    const shouldReduceMotion = useReducedMotion();
    const searchParams = useSearchParams();
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

    const requestedRunId = useMemo(() => {
        const value = searchParams.get("runId");
        return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
    }, [searchParams]);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
        trpc.execution.getAll.useInfiniteQuery(
            { status: statusFilter, limit: 30 },
            { getNextPageParam: (lastPage) => lastPage.nextCursor }
        );

    const runs = data?.pages.flatMap((page) => page.runs) ?? [];

    const hasPendingRuns = runs.some((run) => run.status === "Pending");

    useEffect(() => {
        if (requestedRunId) setSelectedRunId(requestedRunId);
    }, [requestedRunId]);

    useEffect(() => {
        const timer = window.setInterval(() => setNowMs(Date.now()), 100);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!hasPendingRuns) return;
        const interval = window.setInterval(() => void refetch(), 2000);
        return () => window.clearInterval(interval);
    }, [hasPendingRuns, refetch]);

    // Group runs by date
    const groupedRuns = useMemo(() => {
        const groups: { label: string; runs: typeof runs }[] = [];
        const seen: Record<string, number> = {};
        for (const run of runs) {
            const label = formatDateGroup(run.createdAt);
            if (seen[label] === undefined) {
                seen[label] = groups.length;
                groups.push({ label, runs: [] });
            }
            groups[seen[label]]!.runs.push(run);
        }
        return groups;
    }, [runs]);

    const statusCounts = useMemo(() => ({
        all: runs.length,
        pending: runs.filter((r) => r.status === "Pending").length,
        success: runs.filter((r) => r.status === "Success").length,
        failure: runs.filter((r) => r.status === "Failure").length,
    }), [runs]);

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <motion.div
                className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUAD }}
            >
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Activity</h1>
                    <p className="text-sm text-muted-foreground">
                        Real-time feed of all workflow executions
                    </p>
                </div>
                <button
                    onClick={() => void refetch()}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/50 transition-colors hover:border-white/20 hover:text-white"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                </button>
            </motion.div>

            {/* Stats Strip */}
            <motion.div
                className="mb-5 grid grid-cols-4 gap-2"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: EASE_OUT_QUAD, delay: 0.05 }}
            >
                {[
                    { label: "Total", value: statusCounts.all, icon: Activity, color: "text-white/60" },
                    { label: "Success", value: statusCounts.success, icon: CheckCircle2, color: "text-emerald-400" },
                    { label: "Failed", value: statusCounts.failure, icon: XCircle, color: "text-red-400" },
                    { label: "Running", value: statusCounts.pending, icon: Clock, color: "text-amber-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="flex flex-col items-center gap-0.5 rounded-xl border border-white/8 bg-white/[0.02] py-3"
                    >
                        <Icon className={`h-4 w-4 ${color} mb-1`} />
                        <span className="text-lg font-bold text-white">{value}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{label}</span>
                    </div>
                ))}
            </motion.div>

            {/* Filter Pills */}
            <motion.div
                className="mb-4 flex gap-2 overflow-x-auto scrollbar-none"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
            >
                {([undefined, "Pending", "Success", "Failure"] as const).map((status) => (
                    <button
                        key={status ?? "all"}
                        onClick={() => setStatusFilter(status)}
                        className={`relative shrink-0 px-3 py-1.5 rounded text-sm transition-colors ${statusFilter === status ? "text-white" : "text-white/45 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        {statusFilter === status && (
                            <motion.div
                                className="absolute inset-0 bg-white/12 rounded"
                                layoutId="activity-filter"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative">{status ?? "All"}</span>
                    </button>
                ))}
            </motion.div>

            {/* Feed */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : runs.length === 0 ? (
                <motion.div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Activity className="mb-3 h-10 w-10 text-white/15" />
                    <p className="text-sm text-white/40">No executions found.</p>
                    <p className="text-xs text-white/25 mt-1">Run a workflow to see activity here.</p>
                </motion.div>
            ) : (
                <div className="space-y-6">
                    {groupedRuns.map(({ label, runs: groupRuns }) => (
                        <div key={label}>
                            <div className="mb-3 flex items-center gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35">{label}</span>
                                <div className="h-px flex-1 bg-white/8" />
                            </div>
                            <motion.div
                                className="space-y-2"
                                initial="hidden"
                                animate="show"
                                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
                            >
                                {groupRuns.map((run) => {
                                    const successNodes = run.nodeRuns.filter((n) => n.status === "Success").length;
                                    const totalNodes = run.nodeRuns.length;
                                    const duration = run.finishedAt
                                        ? formatDuration(run.createdAt, run.finishedAt, nowMs)
                                        : run.status === "Pending"
                                            ? formatDuration(run.createdAt, null, nowMs)
                                            : "—";

                                    return (
                                        <motion.button
                                            key={run.id}
                                            variants={
                                                shouldReduceMotion
                                                    ? {}
                                                    : {
                                                        hidden: { opacity: 0, y: 8 },
                                                        show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: EASE_OUT_QUAD } },
                                                    }
                                            }
                                            onClick={() => setSelectedRunId(run.id)}
                                            className="w-full text-left rounded-xl border border-white/8 bg-[#141414] px-4 py-3 transition-[border-color,background-color] duration-200 hover:border-white/15 hover:bg-white/[0.03] active:bg-white/[0.05]"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <StatusBadge status={run.status} />
                                                    <span className="truncate text-sm font-medium text-white/70">
                                                        {run.workflow.title || "Untitled Workflow"}
                                                    </span>
                                                </div>
                                                <span className="shrink-0 text-xs text-white/35">{timeAgo(run.createdAt, nowMs)}</span>
                                            </div>
                                            <div className="mt-1.5 flex items-center gap-3 text-xs text-white/40">
                                                <span>{totalNodes > 0 ? `${successNodes}/${totalNodes} nodes` : "No nodes"}</span>
                                                <span className="h-1 w-1 rounded-full bg-white/20" />
                                                <span>{duration}</span>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        </div>
                    ))}

                    {hasNextPage && (
                        <div className="text-center">
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="px-4 py-2 text-sm text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-40"
                            >
                                {isFetchingNextPage ? "Loading..." : "Load more"}
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ExecutionDetailSheet
                runId={selectedRunId}
                open={selectedRunId !== null}
                onOpenChange={(open) => { if (!open) setSelectedRunId(null); }}
                nowMs={nowMs}
            />
        </div>
    );
}

function ActivityFeedFallback() {
    return (
        <div className="flex-1 flex flex-col">
            <div className="mb-6">
                <div className="h-8 w-32 rounded bg-white/5 animate-pulse mb-2" />
                <div className="h-4 w-56 rounded bg-white/5 animate-pulse" />
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
            <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                ))}
            </div>
        </div>
    );
}

export default function ActivityPage() {
    return (
        <Suspense fallback={<ActivityFeedFallback />}>
            <ActivityFeedContent />
        </Suspense>
    );
}
