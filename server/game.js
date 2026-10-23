import { pool } from "./db.js";

export async function startGame(roomId, memberId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const memberResult = await client.query(
      `SELECT id, role, room_id
        FROM members
        WHERE id = $1 AND room_id = $2`,
      [memberId, roomId],
    );

    if (
      memberResult.rows.length === 0 ||
      memberResult.rows[0].role !== "host"
    ) {
      const error = new Error("Только ведущий может начать игру");
      error.code = "FORBIDDEN";
      throw error;
    }

    const roomResult = await client.query(
      `SELECT id, status, quiz_id
        FROM rooms
        WHERE id = $1
        FOR UPDATE`,
      [roomId],
    );

    if (roomResult.rows.length === 0) {
      const error = new Error("Комната не найдена");
      error.code = "ROOM_NOT_FOUND";
      throw error;
    }

    const room = roomResult.rows[0];

    if (room.status !== "lobby") {
      const error = new Error("Игру можно начать только из лобби");
      error.code = "INVALID_STATE";
      throw error;
    }

    const playersCountResult = await client.query(
      `SELECT count(*)::integer AS count
        FROM members
        WHERE room_id = $1 AND role = 'player'`,
      [roomId],
    );

    if (playersCountResult.rows[0].count === 0) {
      const error = new Error("Для начала игры нужен хотя бы один игрок");
      error.code = "NOT_ENOUGH_PLAYERS";
      throw error;
    }

    const questionResult = await client.query(
      `SELECT id, text, position, duration_seconds
        FROM questions
        WHERE quiz_id = $1
        ORDER BY position ASC
        LIMIT 1`,
      [room.quiz_id],
    );

    if (questionResult.rows.length === 0) {
      const error = new Error("В этом квизе нет вопросов");
      error.code = "INTERNAL_ERROR";
      throw error;
    }

    const question = questionResult.rows[0];

    await client.query(
      `UPDATE rooms
        SET status = 'question'
        WHERE id = $1`,
      [roomId],
    );

    const roundResult = await client.query(
      `INSERT INTO rounds (room_id, question_id, started_at, ends_at)
        VALUES ($1, $2, now(), now() + ($3 || ' seconds')::interval)
        RETURNING id, question_id, started_at, ends_at`,
      [roomId, question.id, question.duration_seconds],
    );

    const round = roundResult.rows[0];

    const optionsResult = await client.query(
      `SELECT id, text
        FROM options
        WHERE question_id = $1
        ORDER BY position ASC`,
      [question.id],
    );

    await client.query("COMMIT");

    return {
      id: round.id,
      number: question.position,
      question: {
        id: question.id,
        text: question.text,
        options: optionsResult.rows,
      },
      endsAt: round.ends_at.toISOString(),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getCurrentRound(roomId) {
  const roundResult = await pool.query(
    `SELECT r.id, r.question_id, r.started_at, r.ends_at, r.closed_at,
            q.text AS question_text, q.position AS question_position
        FROM rounds r
        JOIN questions q ON q.id = r.question_id
        WHERE r.room_id = $1
        ORDER BY r.started_at DESC
        LIMIT 1`,
    [roomId],
  );

  if (roundResult.rows.length === 0) {
    return null;
  }

  const round = roundResult.rows[0];

  const optionsResult = await pool.query(
    `SELECT id, text
    FROM options
    WHERE question_id = $1
    ORDER BY position ASC`,
    [round.question_id],
  );

  return {
    id: round.id,
    number: round.question_position,
    question: {
      id: round.question_id,
      text: round.question_text,
      options: optionsResult.rows,
    },
    endsAt: round.ends_at.toISOString(),
    closedAt: round.closed_at ? round.closed_at.toISOString() : null,
  };
}

export async function closeCurrentRound(roomId, roundId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE rounds
            SET closed_at = now()
            WHERE id = $1 AND closed_at IS NULL`,
      [roundId],
    );

    await client.query(
      `UPDATE rooms
        SET status = 'round_results'
        WHERE id = $1 AND status = 'question'`,
      [roomId],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
