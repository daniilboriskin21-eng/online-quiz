import express from "express";
import cookieParser from "cookie-parser";
import { pool } from "./db.js";
import { findSessionByToken } from "./session.js";

const app = express();
app.use(cookieParser());

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

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
