import { createApp } from "./app";

// Start HTTP server when not on Vercel (local dev + Railway)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8080;
  createApp().then(({ httpServer }) => {
    httpServer.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`API running on port ${PORT}`);
    });
  });
}
