import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { db } from "./db";
import { users } from "../shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ================= SIGNUP =================

  app.post(
    "/api/auth/signup",
    async (
      req: Request<{}, {}, { email: string; mobile: string; countryCode?: string }>,
      res: Response
    ) => {
      try {

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

        const newUser = {
          id: crypto.randomUUID(),
          email,
          mobile,
          countryCode: countryCode ?? "+91",
          role: "user",
        };

        const inserted = await db
          .insert(users)
          .values(newUser)
          .returning();

        return res.json({
          user: inserted[0],
        });

      } catch (e: any) {
        console.error("Signup Error:", e);
        return res.status(500).json({
          message: "Signup failed",
          error: e.message,
        });
      }
    }
  );

  // ================= LOGIN =================

  app.post(
    "/api/auth/login",
    async (
      req: Request<{}, {}, { email: string }>,
      res: Response
    ) => {
      try {

        const { email } = req.body;

        if (!email) {
          return res.status(400).json({
            message: "Email required",
          });
        }

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
        return res.status(500).json({
          message: "Login failed",
        });
      }
    }
  );

  // ================= HEALTH =================

  app.get("/api/health", async (_req, res) => {
    try {
      await db.query.users.findMany();
      return res.json({ status: "connected" });
    } catch (e: any) {
      console.error("DB Health Check Failed:", e);
      return res.status(500).json({
        message: e.message,
      });
    }
  });

  return httpServer;
}