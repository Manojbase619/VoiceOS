import { createApp } from "./app";

async function startServer() {
  try {
    const { httpServer } = await createApp();

    const PORT = process.env.PORT || 8080;

    httpServer.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`API Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
}

startServer();