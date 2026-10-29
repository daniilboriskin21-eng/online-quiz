import { Router } from "express";
import { pool } from "../db/index.js";
import { findSessionByToken, hashSessionToken } from "../services/session.service.js";

export const sessionRouter = Router();

sessionRouter.get("/", async (req, res) => {
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

sessionRouter.post("/leave", async (req, res) => {
  try {
    const token = req.cookies.session_token;

    if (token) {
      const tokenHash = hashSessionToken(token);
      await pool.query(
        `UPDATE members
         SET session_revoked_at = now()
         WHERE session_token_hash = $1`,
        [tokenHash],
      );
    }

    res.clearCookie("session_token");
    res.json({ data: { success: true } });
  } catch (error) {
    console.error("Ошибка выхода из сессии:", error.message);
    res.clearCookie("session_token");
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Не удалось выйти из игры",
      },
    });
  }
});
