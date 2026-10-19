import { pool } from "./db.js";
import { generateRoomCode } from "./room-code.js";
import { generateSessionToken, hashSessionToken } from "./session.js";

export async function createRoom(quizId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let room;

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRoomCode();

      const roomResult = await client.query(
        `INSERT INTO rooms (code, quiz_id)
            VALUES ($1, $2)
            ON CONFLICT (code) DO NOTHING
            RETURNING id, code, quiz_id, status`,
        [code, quizId],
      );

      if (roomResult.rows.length > 0) {
        room = roomResult.rows[0];
        break;
      }
    }

    if (!room) {
      throw new Error("Не удалось подобрать свободный код комнаты");
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);

    const memberResult = await client.query(
      `INSERT INTO members (
            room_id, role, session_token_hash, session_expires_at
        )
        VALUES ($1, 'host', $2, now() + interval '7 days')
        RETURNING id, role, session_expires_at`,
      [room.id, tokenHash],
    );

    const member = memberResult.rows[0];

    await client.query("COMMIT");

    return { room, member, token };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function joinRoom(rawCode, rawNickname) {
  const code = String(rawCode ?? "")
    .trim()
    .toUpperCase();
  if (code.length !== 6) {
    const error = new Error("Код комнаты должен состоять из 6 символов");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const nickname = String(rawNickname ?? "").trim();
  if (nickname.length < 1 || nickname.length > 20) {
    const error = new Error("Никнейм должен быть от 1 до 20 символов");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const roomResult = await pool.query(
    `SELECT id, code, status
    FROM rooms
    WHERE code = $1`,
    [code],
  );

  if (roomResult.rows.length === 0) {
    const error = new Error("Комната не найдена");
    error.code = "ROOM_NOT_FOUND";
    throw error;
  }

  const room = roomResult.rows[0];

  if (room.status !== "lobby") {
    const error = new Error("Игра уже началась или завершена");
    error.code = "GAME_ALREADY_STARTED";
    throw error;
  }

  const isFreeNickname = await pool.query(
    `SELECT id FROM members
    WHERE room_id = $1 AND role = 'player' AND lower(trim(nickname)) = lower($2)`,
    [room.id, nickname],
  );

  if (isFreeNickname.rows.length !== 0) {
    const error = new Error("Этот никнейм уже занят в комнате");
    error.code = "NICKNAME_TAKEN";
    throw error;
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const memberResult = await pool.query(
    `INSERT INTO members (
            room_id, role, nickname, session_token_hash, session_expires_at
        )
        VALUES ($1, 'player', $2, $3, now() + interval '7 days')
        RETURNING id, role, nickname, session_expires_at`,
    [room.id, nickname, tokenHash],
  );

  const member = memberResult.rows[0];

  return { room, member, token };
}
