import express from "express";
import { createServer } from "http";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();
const httpServer = createServer(app);

// CORS: allow Vercel frontend and localhost
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin.endsWith(".vercel.app") || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
        return cb(null, true);
      }
      return cb(null, true); // allow other origins (e.g. custom domain)
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function startServer() {

  await registerRoutes(httpServer, app);

  const PORT = process.env.PORT || 8080;

  httpServer.listen(
    Number(PORT),
    "0.0.0.0",
    () => {
      console.log(`API Server running on port ${PORT}`);
    }
  );

}

startServer();
