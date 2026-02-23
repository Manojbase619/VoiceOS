const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("PORT not provided by Railway");
}

httpServer.listen({
  port: Number(PORT),
  host: "0.0.0.0",
}, () => {
  console.log(`Server running on ${PORT}`);
});