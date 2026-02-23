import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { db } from "./db";
import { users } from "../shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(
    "/api/auth/signup",
    async (
      req: Request<{}, {}, {
        email: string;
        mobile: string;
        countryCode?: string;
      }>,
      res: Response
    ) => {

      const { email, mobile, countryCode } = req.body as { email: string; mobile: string; countryCode?: string };

      const [user] = await db.insert(users).values({
        id: crypto.randomUUID(),
        email: String(email),
        mobile: String(mobile),
        ...(countryCode != null && { countryCode: String(countryCode) }),
      }).returning();

      return res.json({ user });
    }
  );

  app.get("/api/health", async (_, res) => {
    await db.query.users.findMany();
    return res.json({ status: "connected" });
  });

  return httpServer;
}