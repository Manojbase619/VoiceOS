import express from "express";
import path from "path";

export function serveStatic(app: express.Express) {

  const publicPath = path.join(process.cwd(), "dist", "public");

  app.use(express.static(publicPath));

  // EXPRESS 5 SAFE CATCH ALL (path-to-regexp requires named pattern e.g. .* not *)
  app.get("/:path(.*)", (_, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });

}
