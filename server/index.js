import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

import { setupSocket, broadcastRoomState } from "./socket/index.js";
import { recoverActiveRounds } from "./services/timer.service.js";
import { quizzesRouter } from "./routes/quizzes.js";
import { sessionRouter } from "./routes/session.js";
import { createRoomsRouter } from "./routes/rooms.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cookieParser());
app.use(express.json());

// Подключение Socket.IO
setupSocket(io);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Подключение маршрутов API
app.use("/api/quizzes", quizzesRouter);
app.use("/api/session", sessionRouter);
app.use(
  "/api/rooms",
  createRoomsRouter((roomId, roomCode) =>
    broadcastRoomState(io, roomId, roomCode),
  ),
);

const port = Number(process.env.PORT ?? 3000);

server.listen(port, async () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
  await recoverActiveRounds((roomId, roomCode) =>
    broadcastRoomState(io, roomId, roomCode),
  );
});
