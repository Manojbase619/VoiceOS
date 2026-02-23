import { createApp } from "./app";

// Only start HTTP server locally; Vercel uses api/index.ts
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;

  createApp().then(({ httpServer }) => {
    httpServer.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Local API running on ${PORT}`);
    });
  });
}
