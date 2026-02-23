import { router, protectedProcedure } from "../trpc";
import { prisma } from "@repo/prisma";

export const analyticsRouter = router({
    /**
     * Returns aggregated workflow run stats for the current user.
     * Used by the dashboard RunSummaryWidget.
     */
    getRunSummary: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.session!.user.id;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Get all workflow IDs for this user
        const workflows = await prisma.workflow.findMany({
            where: { userId },
            select: { id: true },
        });

        if (workflows.length === 0) {
            return {
                totalRuns: 0,
                successCount: 0,
                failureCount: 0,
                pendingCount: 0,
                successRate: null as number | null,
                last7Days: [] as { date: string; success: number; failure: number }[],
                lastRunAt: null as string | null,
            };
        }

        const workflowIds = workflows.map((w) => w.id);

        // Total run counts by status (all time)
        const runCounts = await prisma.workflowRun.groupBy({
            by: ["status"],
            where: { workflowId: { in: workflowIds } },
            _count: true,
        });

        let totalRuns = 0;
        let successCount = 0;
        let failureCount = 0;
        let pendingCount = 0;

        for (const row of runCounts) {
            totalRuns += row._count;
            if (row.status === "Success") successCount = row._count;
            else if (row.status === "Failure") failureCount += row._count;
            else pendingCount += row._count;
        }

        const successRate =
            totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : null;

        // Last run timestamp — use createdAt (the only timestamp guaranteed on WorkflowRun)
        const latestRun = await prisma.workflowRun.findFirst({
            where: { workflowId: { in: workflowIds } },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
        });

        // Last 7 days: fetch runs and group by day + status in JS
        const recentRuns = await prisma.workflowRun.findMany({
            where: {
                workflowId: { in: workflowIds },
                createdAt: { gte: sevenDaysAgo },
            },
            select: { createdAt: true, status: true },
            orderBy: { createdAt: "asc" },
        });

        // Build a map: date string → { success, failure }
        const dayMap = new Map<string, { success: number; failure: number }>();
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            dayMap.set(key, { success: 0, failure: 0 });
        }

        for (const run of recentRuns) {
            const key = new Date(run.createdAt).toISOString().slice(0, 10);
            const existing = dayMap.get(key);
            if (!existing) continue;
            if (run.status === "Success") existing.success++;
            else if (run.status === "Failure") existing.failure++;
        }

        const last7Days = Array.from(dayMap.entries()).map(([date, counts]) => ({
            date,
            ...counts,
        }));

        return {
            totalRuns,
            successCount,
            failureCount,
            pendingCount,
            successRate,
            last7Days,
            lastRunAt: latestRun?.createdAt?.toISOString() ?? null,
        };
    }),
});
