import { createApp } from "./app";

const PORT = process.env.PORT || 8080;

async function start() {
  const { httpServer } = await createApp();

  httpServer.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
  });
}

start();