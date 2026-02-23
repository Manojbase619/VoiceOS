export const runtime = "nodejs";

import serverless from "serverless-http";
import { createApp } from "../server/app";

let handler: ReturnType<typeof serverless> | null = null;

export default async function (req: any, res: any) {
  try {
    if (!handler) {
      const { app } = await createApp();
      handler = serverless(app);
    }

    return await handler(req, res);
  } catch (err) {
    console.error("Function invocation failed:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
        error: err instanceof Error ? err.message : String(err),
      })
    );
  }
}