import express from "express";

const app = express();

const port = Number(process.env.PORT ?? 3000);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
