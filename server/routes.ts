import crypto from "node:crypto";
import type { Express } from "express";
import { type Server } from "http";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Path is /auth/signup when run behind Vercel (api/index strips /api prefix)
  app.post("/auth/signup", async (req, res) => {
    try {

      const { email, mobile, countryCode } = req.body;

      if (!email || !mobile) {
        return res.status(400).json({
          message: "Email and mobile required",
        });
      }

      // ✅ Neon HTTP compatible query
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        return res.json({ user: existing[0] });
      }

      const [user] = await db.insert(users).values({
        email,
        mobile,
        countryCode: countryCode ?? "+91",
      }).returning();

      return res.json({ user });

    } catch (e: any) {
      console.error("Signup Error:", e);
      return res.status(500).json({
        message: e.message,
      });
    }
  });

  return httpServer;
}