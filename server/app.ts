import "dotenv/config";

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import type { Server } from "http";
import type { Express } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

export async function createApp(): Promise<{ app: Express; httpServer: Server }> {

  const app = express();
  const httpServer = createServer(app);

  // ✅ HARDCODED CORS HEADERS (EXPRESS 5 SAFE)
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

    // VERY IMPORTANT → respond to OPTIONS manually
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
    })
  );

  app.use(express.urlencoded({ extended: false }));

  // Railway health checks
  app.get("/health", (_, res) => res.status(200).send("OK"));
  app.get("/", (_, res) => res.status(200).send("OK"));

  // Register API routes
  await registerRoutes(httpServer, app);

  // Global error handler: always send JSON body and log full error for debugging
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