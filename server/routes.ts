import crypto from "node:crypto";
import type { Express } from "express";
import { type Server } from "http";
import { db } from "./db";
import { users } from "../shared/schema";
import { storage } from "./storage";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ================= AUTH =================

  app.post("/api/auth/signup", async (req, res) => {
    try {

      const body = req.body as {
        email: string;
        mobile: string;
        countryCode?: string;
      };

      const email: string = body.email;
      const mobile: string = body.mobile;
      const countryCode: string = body.countryCode ?? "+91";

      if (!email || !mobile) {
        return res.status(400).json({ message: "Email and mobile required" });
      }

      const existing = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });

      if (existing) {
        return res.json({ user: existing });
      }

      const [user] = await db.insert(users).values({
        id: crypto.randomUUID(),
        email: String(email),
        mobile: String(mobile),
        countryCode: String(countryCode),
      }).returning();

      return res.json({ user });

    } catch (e: unknown) {
      const err = e as Error;
      console.error("Signup Error:", err.message);
      return res.status(500).json({
        message: "Signup failed",
        error: err.message,
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {

      const email: string = req.body.email;

      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });

      if (!user) {
        return res.status(404).json({
          message: "No account found with this email.",
        });
      }

      return res.json({ user });

    } catch (e: any) {
      console.error("Login Error:", e);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  // ================= HEALTH =================

  app.get("/api/health", async (_, res) => {
    try {
      await db.query.users.findMany();
      return res.json({ status: "connected" });
    } catch (e: any) {
      console.error("DB Health Check Failed:", e);
      return res.status(500).json({ message: e.message });
    }
  });

  return httpServer;
}