import { createApp, log } from "./app";
import { serveStatic } from "./static";

(async () => {

  const { app, httpServer } = await createApp();

  // 🚨 Railway healthcheck MUST respond on root
  app.get("/", (_, res) => {
    res.status(200).send("OK");
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const PORT = process.env.PORT || 8080;

  httpServer.listen({
    port: Number(PORT),
    host: "0.0.0.0",
  }, () => {
    log(`Server running on port ${PORT}`);
  });

})();