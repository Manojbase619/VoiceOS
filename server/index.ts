import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Railway internal healthcheck
app.get("/health", (_, res) => {
  res.status(200).send("OK");
});

app.get("/", (_, res) => {
  res.status(200).send("OK");
});

async function startServer() {

  await registerRoutes(httpServer, app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const PORT = process.env.PORT;

  if (!PORT) {
    throw new Error("PORT not provided by Railway");
  }

  httpServer.listen({
    port: Number(PORT),
    host: "0.0.0.0",
  }, () => {
    console.log(`Server running on port ${PORT}`);
  });

}

startServer();