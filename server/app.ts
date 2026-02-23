import "dotenv/config";

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import type { Server } from "http";
import type { Express } from "express";
import { registerRoutes } from "./routes";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function createApp(): Promise<{ app: Express; httpServer: Server }> {

  const app = express();
  const httpServer = createServer(app);

  // 🚨 HANDLE CORS + PREFLIGHT BEFORE ANYTHING (EXPRESS 5 SAFE)
  app.use((req, res, next) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));

  // 🚨 RAILWAY HEALTHCHECK
  app.get("/health", (_, res) => {
    return res.status(200).send("OK");
  });

  app.get("/", (_, res) => {
    return res.status(200).send("OK");
  });

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    const originalResJson = res.json.bind(res);
    res.json = function (bodyJson: unknown, ...args: unknown[]) {
      capturedJsonResponse = bodyJson as Record<string, unknown>;
      return originalResJson(bodyJson, ...args);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });

    next();
  });

  // REGISTER API ROUTES AFTER PREFLIGHT HANDLER
  await registerRoutes(httpServer, app);

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const status =
      (err as { status?: number }).status ??
      (err as { statusCode?: number }).statusCode ??
      500;

    const message = (err as Error).message ?? "Internal Server Error";
    console.error("Internal Server Error:", err);

    if (res.headersSent) return next(err);

    return res.status(status).json({ message });
  });

  return { app, httpServer };
}