import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveStatic(app: express.Express) {

  const distPath = path.resolve(__dirname, "../dist/public");

  app.use(express.static(distPath));

  // SPA fallback: serve index.html for any non-file GET (Express 5 path-to-regexp needs named param)
  app.get("/:path(.*)", (_, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

}