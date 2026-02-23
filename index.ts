/**
 * Vercel entry: export Express app for serverless.
 * Local dev uses server/index.ts instead.
 */
import { createApp } from "./server/app";

const { app } = await createApp();
export default app;
