import { Router } from "express";
import { pool } from "../db/index.js";

export const quizzesRouter = Router();

quizzesRouter.get("/", async (req, res) => {
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
