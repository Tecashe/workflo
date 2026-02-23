import { router } from "../trpc";
import { credentialsRouter } from "./credentials";
import { executionRouter } from "./execution";
import { workflowRouter } from "./workflow";
import { billingRouter } from "./billing";
export const appRouter = router({
    workflow: workflowRouter,
    credentials: credentialsRouter,
    execution: executionRouter,
    billing: billingRouter,
});
export type AppRouter = typeof appRouter;
