export const runtime = "nodejs";

import serverless from "serverless-http";
import { createApp } from "../server/app";

let handler: any;

export default async function (req: any, res: any) {
  if (!handler) {
    const { app } = await createApp();

    // remove /api prefix so Express routes match
    app.use((req, _res, next) => {
      req.url = req.url.replace(/^\/api/, "");
      next();
    });

    handler = serverless(app);
  }

  return handler(req, res);
}