import cookieParser from "cookie-parser";
import { pool } from "../db/index.js";
import { findSessionByToken } from "../services/session.service.js";
import {
  isMemberOnline,
  addMemberSocket,
  removeMemberSocket,
} from "../services/presence.service.js";
import {
  scheduleRoundTimer,
  clearRoundTimer,
} from "../services/timer.service.js";
import {
  startGame,
  getCurrentRound,
  submitAnswer,
  getRoundResults,
  continueGame,
} from "../services/game.service.js";

export async function broadcastRoomState(io, roomId, roomCode) {
  try {
    const roomResult = await pool.query(
      `SELECT r.id, r.code, r.status, q.title AS "quizTitle", count(qu.id)::integer AS "questionCount"
       FROM rooms r
       JOIN quizzes q ON q.id = r.quiz_id
       LEFT JOIN questions qu ON qu.quiz_id = q.id
       WHERE r.id = $1
       GROUP BY r.id, r.code, r.status, q.title`,
      [roomId],
    );

    if (roomResult.rows.length === 0) return;
    const room = roomResult.rows[0];

    const memberResult = await pool.query(
      `SELECT id, role, nickname
       FROM members
       WHERE room_id = $1
       ORDER BY id`,
      [roomId],
    );

    const host = memberResult.rows.find((m) => m.role === "host");
    const players = memberResult.rows
      .filter((m) => m.role === "player")
      .map((p) => ({
        id: p.id,
        nickname: p.nickname,
        online: isMemberOnline(p.id),
      }));

    const hostOnline = host ? isMemberOnline(host.id) : false;

    const sockets = await io.in(roomCode).fetchSockets();

    let currentRound = null;
    let roundResults = null;
    const answersMap = new Map();

    if (
      room.status === "question" ||
      room.status === "round_results" ||
      room.status === "finished"
    ) {
      currentRound = await getCurrentRound(roomId);

      if (currentRound) {
        const answersResult = await pool.query(
          `SELECT member_id, option_id, text_answer, points FROM answers WHERE round_id = $1`,
          [currentRound.id],
        );

        for (const row of answersResult.rows) {
          answersMap.set(row.member_id, {
            optionId: row.option_id,
            textAnswer: row.text_answer,
            points: row.points,
          });
        }

        if (room.status === "round_results" || room.status === "finished") {
          roundResults = await getRoundResults(roomId, currentRound.id);
        }
      }
    }

    for (const socket of sockets) {
      const mySession = socket.data.session;
      const rawAnswer = answersMap.get(mySession.id);
      const myAnswer = rawAnswer
        ? {
            optionId: rawAnswer.optionId,
            textAnswer: rawAnswer.textAnswer,
            // Скрываем правильность ответа во время активного вопроса (data hiding):
            ...(room.status !== "question"
              ? { isCorrect: rawAnswer.points > 0 }
              : {}),
          }
        : null;

      socket.emit("room:state", {
        room: {
          code: room.code,
          status: room.status,
          quizTitle: room.quizTitle,
          questionCount: room.questionCount,
        },
        hostOnline,
        players,
        me: {
          memberId: mySession.id,
          role: mySession.role,
          nickname: mySession.nickname,
        },
        round: currentRound,
        myAnswer,
        results: roundResults,
      });
    }
  } catch (error) {
    console.error("Ошибка рассылки room:state:", error.message);
  }
}

export function setupSocket(io) {
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
    addMemberSocket(session.id, socket.id);

    console.log(
      `Сокет ${socket.id}: подключился ${session.role} (${session.nickname || "Ведущий"}) к комнате ${session.room_code}`,
    );

    broadcastRoomState(io, session.room_id, session.room_code);

    socket.on("game:start", async (data, callback) => {
      try {
        const round = await startGame(session.room_id, session.id);
        scheduleRoundTimer(
          session.room_id,
          session.room_code,
          round.id,
          round.endsAt,
          (rId, rCode) => broadcastRoomState(io, rId, rCode),
        );
        await broadcastRoomState(io, session.room_id, session.room_code);

        if (typeof callback === "function") {
          callback({ ok: true, data: { roundId: round.id } });
        }
      } catch (error) {
        console.error("Ошибка game:start:", error.message);
        if (typeof callback === "function") {
          callback({
            ok: false,
            error: {
              code: error.code || "INTERNAL_ERROR",
              message: error.message,
            },
          });
        }
      }
    });

    socket.on("game:continue", async (data, callback) => {
      try {
        const result = await continueGame(session.room_id, session.id);

        if (result.action === "next_question") {
          scheduleRoundTimer(
            session.room_id,
            session.room_code,
            result.round.id,
            result.round.endsAt,
            (rId, rCode) => broadcastRoomState(io, rId, rCode),
          );
        } else if (result.action === "finished") {
          clearRoundTimer(session.room_id);
        }

        await broadcastRoomState(io, session.room_id, session.room_code);

        if (typeof callback === "function") {
          callback({ ok: true, data: result });
        }
      } catch (error) {
        console.error("Ошибка game:continue:", error.message);
        if (typeof callback === "function") {
          callback({
            ok: false,
            error: {
              code: error.code || "INTERNAL_ERROR",
              message: error.message,
            },
          });
        }
      }
    });

    socket.on("answer:submit", async (data, callback) => {
      try {
        const { roundId, optionId, textAnswer } = data || {};
        if (!roundId || (optionId === undefined && textAnswer === undefined)) {
          const error = new Error("Не указан roundId или ответ");
          error.code = "VALIDATION_ERROR";
          throw error;
        }

        const result = await submitAnswer(
          session.room_id,
          session.id,
          roundId,
          { optionId, textAnswer },
        );

        await broadcastRoomState(io, session.room_id, session.room_code);

        if (typeof callback === "function") {
          callback({ ok: true, data: result });
        }
      } catch (error) {
        console.error("Ошибка answer:submit:", error.message);
        if (typeof callback === "function") {
          callback({
            ok: false,
            error: {
              code: error.code || "INTERNAL_ERROR",
              message: error.message,
            },
          });
        }
      }
    });

    socket.on("disconnect", () => {
      removeMemberSocket(session.id, socket.id);
      console.log(`Сокет ${socket.id} отключился`);
      broadcastRoomState(io, session.room_id, session.room_code);
    });
  });
}
