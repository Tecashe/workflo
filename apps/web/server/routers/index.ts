import { router } from "../trpc";
import { credentialsRouter } from "./credentials";
import { executionRouter } from "./execution";
import { workflowRouter } from "./workflow";
import { billingRouter } from "./billing";
import { analyticsRouter } from "./analytics";
export const appRouter = router({
    workflow: workflowRouter,
    credentials: credentialsRouter,
    execution: executionRouter,
    billing: billingRouter,
    analytics: analyticsRouter,
});
export type AppRouter = typeof appRouter;
