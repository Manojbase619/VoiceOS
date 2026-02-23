import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";

const app = express();
const httpServer = createServer(app);

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
