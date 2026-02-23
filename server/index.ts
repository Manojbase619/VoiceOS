const PORT = process.env.PORT || 8080;

httpServer.listen({
  port: Number(PORT),
  host: "0.0.0.0",
}, () => {
  log(`Server running on port ${PORT}`);
});