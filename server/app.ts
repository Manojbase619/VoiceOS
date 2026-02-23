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

export async function createApp(): Promise<{ app: Express; httpServer: Server }> {

  const app = express();
  const httpServer = createServer(app);

  // Strip /api prefix when behind Vercel rewrite so routes can be registered as /health, /auth/signup
  app.use((req, _res, next) => {
    if (typeof req.url === "string" && req.url.startsWith("/api")) {
      req.url = req.url === "/api" ? "/" : req.url.slice(4);
    }
    next();
  });

  // CORS headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });

  // Body parser (required in serverless)
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.use(express.urlencoded({ extended: false }));

  // Health checks
  app.get("/health", (_, res) => res.status(200).send("OK"));
  app.get("/", (_, res) => res.status(200).send("OK"));

  // Register API routes
  await registerRoutes(httpServer, app);

  // Global error handler
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const status =
      (err as { status?: number }).status ??
      (err as { statusCode?: number }).statusCode ??
      500;
    const message = (err as Error).message ?? "Internal Server Error";
    console.error("Internal Server Error:", message);
    console.error((err as Error).stack);

    if (res.headersSent) return next(err);

    return res.status(status).json({
      message: message || "An unexpected error occurred",
      error: process.env.NODE_ENV !== "production" ? (err as Error).stack : undefined,
    });
  });

  return { app, httpServer };
}