import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function startServer() {

  await registerRoutes(httpServer, app);

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
    console.log(`Server running on port ${PORT}`);
  });

}

startServer();