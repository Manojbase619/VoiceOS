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

      const { email, mobile, countryCode } = req.body;

      if (!email || !mobile) {
        return res.status(400).json({
          message: "Email and mobile required",
        });
      }

      const existing = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });

      if (existing) {
        return res.json({ user: existing });
      }

      const [user] = await db
        .insert(users)
        .values({
          email,
          mobile,
          countryCode,
        })
        .returning();

      return res.json({ user });
    }
  );

  app.get("/api/health", async (_, res) => {
    await db.query.users.findMany();
    return res.json({ status: "connected" });
  });

  return httpServer;
}