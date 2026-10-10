import express from "express";
import { pool } from "./db.js";

const app = express();

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

app.listen(port, () => {
  console.log(`Сервер запущен: http://localhost:${port}`);
});
