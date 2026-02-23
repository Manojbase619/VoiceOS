import { createApp } from "./app";

async function startServer() {

  const { httpServer } = await createApp();

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