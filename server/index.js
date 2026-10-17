import express from "express";
import cookieParser from "cookie-parser";
import { pool } from "./db.js";
import { findSessionByToken } from "./session.js";
import { createRoom } from "./rooms.js";

const app = express();
app.use(cookieParser());
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
