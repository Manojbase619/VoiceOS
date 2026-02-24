import { createApp } from "./app";

const PORT = process.env.PORT || 8080;

async function start() {
  const { httpServer } = await createApp();

  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`API running on port ${PORT}`);
  });
}

start();
