import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import { pool } from "./db.js";
import { findSessionByToken } from "./session.js";
import { createRoom, joinRoom } from "./rooms.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cookieParser());
app.use(express.json());
io.engine.use(cookieParser());

io.use(async (socket, next) => {
  try {
    const token = socket.request.cookies?.session_token;

    if (!token) {
      return next(new Error("UNAUTHENTICATED"));
    }

    const session = await findSessionByToken(token);

    if (!session || !session.is_active) {
      return next(new Error("UNAUTHENTICATED"));
    }

    socket.data.session = session;
    next();
  } catch (error) {
    console.error("Ошибка авторизации сокета:", error.message);
    next(new Error("INTERNAL_ERROR"));
  }
});

io.on("connection", (socket) => {
  const session = socket.data.session;

  socket.join(session.room_code);

  console.log(
    `Сокет ${socket.id}: подключился ${session.role} (${session.nickname || "Ведущий"}) к комнате ${session.room_code}`
  );

  socket.on("disconnect", () => {
    console.log(`Сокет ${socket.id} отключился`);
  })
});

const port = Number(process.env.PORT ?? 3000);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/quizzes", async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT
      q.id,
      q.title,
      count(qu.id)::integer AS "questionCount"
    FROM quizzes q
    LEFT JOIN questions qu ON qu.quiz_id = q.id
    GROUP BY q.id, q.title
    ORDER BY q.id;
      `);

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Ошибка получения квизов:", error.message);

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Не удалось загрузить квизы",
      },
    });
  }
});

app.get("/api/session", async (req, res) => {
  try {
    const token = req.cookies.session_token;

    if (!token) {
      return res.json({ data: null });
    }

    const session = await findSessionByToken(token);

    if (!session || !session.is_active) {
      res.clearCookie("session_token");
      return res.json({ data: null });
    }

    res.json({
      data: {
        memberId: session.id,
        roomCode: session.room_code,
        role: session.role,
      },
    });
  } catch (error) {
    console.error("Ошибка проверки сессии:", error.message);

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Не удалось проверить сессию",
      },
    });
  }
});

app.post("/api/rooms", async (req, res) => {
  try {
    const token = req.cookies.session_token;

    if (token) {
      const session = await findSessionByToken(token);

      if (session && session.is_active && session.room_status !== "finished") {
        return res.status(409).json({
          error: {
            code: "SESSION_ALREADY_ACTIVE",
            message: "У вас уже есть активная игра",
          },
        });
      }
    }

    const quizId = Number(req.body?.quizId);

    if (!Number.isInteger(quizId) || quizId <= 0) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Некорректный идентификатор квиза",
        },
      });
    }

    const quizResult = await pool.query(
      "SELECT id FROM quizzes WHERE id = $1",
      [quizId],
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "QUIZ_NOT_FOUND",
          message: "Квиз не найден",
        },
      });
    }

    const { room, member, token: sessionToken } = await createRoom(quizId);

    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      data: {
        room: {
          code: room.code,
          status: room.status,
        },
        me: {
          memberId: member.id,
          role: member.role,
        },
      },
    });
  } catch (error) {
    console.error("Ошибка создания комнаты:", error.message);

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Не удалось создать комнату",
      },
    });
  }
});

app.get("/api/rooms/:code", async (req, res) => {
  try {
    const token = req.cookies.session_token;

    const session = await findSessionByToken(token);

    if (!token || !session || !session.is_active) {
      return res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Требуется авторизация",
        },
      });
    }

    const roomCode = req.params.code.trim().toUpperCase();

    if (roomCode !== session.room_code) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "У вас нет доступа к этой комнате",
        },
      });
    }

    const result = await pool.query(
      `
      SELECT
        r.code,
        r.status,
        q.title AS "quizTitle",
        count(qu.id)::integer AS "questionCount"
      FROM rooms r
      JOIN quizzes q ON q.id = r.quiz_id
      LEFT JOIN questions qu ON qu.quiz_id = q.id
      WHERE r.id = $1
      GROUP BY r.code, r.status, q.title
      `,
      [session.room_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "ROOM_NOT_FOUND",
          message: "Комната не найдена",
        },
      });
    }

    const room = result.rows[0];
    res.status(200).json({
      data: {
        room: {
          code: room.code,
          status: room.status,
          quizTitle: room.quizTitle,
          questionCount: room.questionCount,
        },
        me: {
          memberId: session.id,
          role: session.role,
        },
      },
    });
  } catch (error) {
    console.error("Ошибка чтения комнаты:", error.message);

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Не удалось прочитать информацию о комнате",
      },
    });
  }
});

app.post("/api/rooms/:code/join", async (req, res) => {
  try {
    const token = req.cookies.session_token;

    if (token) {
      const session = await findSessionByToken(token);

      if (session && session.is_active && session.room_status !== "finished") {
        return res.status(409).json({
          error: {
            code: "SESSION_ALREADY_ACTIVE",
            message: "У вас уже есть активная игра",
          },
        });
      }
    }

    const {
      room,
      member,
      token: sessionToken,
    } = await joinRoom(req.params.code, req.body?.nickname);

    res.cookie("session_token", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      data: {
        room: {
          code: room.code,
          status: room.status,
        },
        me: {
          memberId: member.id,
          role: member.role,
          nickname: member.nickname,
        },
      },
    });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res
        .status(400)
        .json({ error: { code: error.code, message: error.message } });
    }

    if (error.code === "ROOM_NOT_FOUND") {
      return res
        .status(404)
        .json({ error: { code: error.code, message: error.message } });
    }

    if (
      error.code === "NICKNAME_TAKEN" ||
      error.code === "GAME_ALREADY_STARTED"
    ) {
      return res
        .status(409)
        .json({ error: { code: error.code, message: error.message } });
    }

    console.error("Ошибка входа в комнату:", error.message);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Не удалось войти в комнату",
      },
    });
  }
});

server.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
