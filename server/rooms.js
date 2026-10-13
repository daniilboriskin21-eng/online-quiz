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
