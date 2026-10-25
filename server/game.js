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

export async function submitAnswer(roomId, memberId, roundId, optionId) {
  const memberResult = await pool.query(
    `SELECT id, role, room_id 
     FROM members 
     WHERE id = $1 AND room_id = $2`,
    [memberId, roomId],
  );

  if (
    memberResult.rows.length === 0 ||
    memberResult.rows[0].role !== "player"
  ) {
    const error = new Error("Только игроки могут отвечать на вопросы");
    error.code = "FORBIDDEN";
    throw error;
  }

  const roundResult = await pool.query(
    `SELECT r.id, r.room_id, r.question_id, r.ends_at, r.closed_at,
            (now() <= r.ends_at) AS is_within_time,
            rm.status AS room_status
     FROM rounds r
     JOIN rooms rm ON rm.id = r.room_id
     WHERE r.id = $1 AND r.room_id = $2`,
    [roundId, roomId],
  );

  if (roundResult.rows.length === 0) {
    const error = new Error("Раунд не найден");
    error.code = "ROUND_NOT_FOUND";
    throw error;
  }

  const round = roundResult.rows[0];

  if (
    round.room_status !== "question" ||
    round.closed_at !== null ||
    !round.is_within_time
  ) {
    const error = new Error("Время для ответа истекло");
    error.code = "ROUND_CLOSED";
    throw error;
  }

  const optionResult = await pool.query(
    `SELECT id, question_id, is_correct 
     FROM options 
     WHERE id = $1 AND question_id = $2`,
    [optionId, round.question_id],
  );

  if (optionResult.rows.length === 0) {
    const error = new Error("Недопустимый вариант ответа");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  const option = optionResult.rows[0];

  const existingAnswer = await pool.query(
    `SELECT option_id 
     FROM answers 
     WHERE round_id = $1 AND member_id = $2`,
    [roundId, memberId],
  );

  if (existingAnswer.rows.length > 0) {
    if (existingAnswer.rows[0].option_id === optionId) {
      return { optionId };
    }
    const error = new Error("Ответ уже был дан");
    error.code = "ANSWER_ALREADY_SUBMITTED";
    throw error;
  }

  const points = option.is_correct ? 1 : 0;

  await pool.query(
    `INSERT INTO answers (round_id, member_id, option_id, points, accepted_at)
     VALUES ($1, $2, $3, $4, now())`,
    [roundId, memberId, optionId, points],
  );

  return { optionId };
}

export async function getRoundResults(roomId, roundId) {
  const correctOptionResult = await pool.query(
    `SELECT o.id 
     FROM options o
     JOIN rounds r ON r.question_id = o.question_id
     WHERE r.id = $1 AND o.is_correct = true`,
    [roundId],
  );

  const correctOptionId = correctOptionResult.rows[0]?.id ?? null;

  const leaderboardResult = await pool.query(
    `SELECT m.id AS "memberId",
            m.nickname,
            COALESCE(sum(a.points), 0)::integer AS score
     FROM members m
     LEFT JOIN answers a ON a.member_id = m.id
     WHERE m.room_id = $1 AND m.role = 'player'
     GROUP BY m.id, m.nickname
     ORDER BY score DESC, m.id ASC`,
    [roomId],
  );

  let currentPlace = 1;
  const leaderboard = leaderboardResult.rows.map((row, index, arr) => {
    if (index > 0 && row.score < arr[index - 1].score) {
      currentPlace = index + 1;
    }
    return {
      memberId: row.memberId,
      nickname: row.nickname,
      score: row.score,
      place: currentPlace,
    };
  });

  return {
    correctOptionId,
    leaderboard,
  };
}

export async function continueGame(roomId, memberId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const memberResult = await client.query(
      `SELECT id, role FROM members WHERE id = $1 AND room_id = $2`,
      [memberId, roomId],
    );

    if (
      memberResult.rows.length === 0 ||
      memberResult.rows[0].role !== "host"
    ) {
      const error = new Error("Только ведущий может продолжить игру");
      error.code = "FORBIDDEN";
      throw error;
    }

    const roomResult = await client.query(
      `SELECT id, status, quiz_id FROM rooms WHERE id = $1 FOR UPDATE`,
      [roomId],
    );

    if (roomResult.rows.length === 0) {
      const error = new Error("Комната не найдена");
      error.code = "ROOM_NOT_FOUND";
      throw error;
    }

    const room = roomResult.rows[0];

    if (room.status !== "round_results") {
      const error = new Error(
        "Продолжить игру можно только после подведения итогов раунда",
      );
      error.code = "INVALID_STATE";
      throw error;
    }

    const lastRoundResult = await client.query(
      `SELECT r.id, q.position 
       FROM rounds r
       JOIN questions q ON q.id = r.question_id
       WHERE r.room_id = $1
       ORDER BY r.started_at DESC
       LIMIT 1`,
      [roomId],
    );

    const currentPosition = lastRoundResult.rows[0]?.position ?? 0;

    const nextQuestionResult = await client.query(
      `SELECT id, text, position, duration_seconds 
       FROM questions 
       WHERE quiz_id = $1 AND position > $2 
       ORDER BY position ASC 
       LIMIT 1`,
      [room.quiz_id, currentPosition],
    );

    if (nextQuestionResult.rows.length === 0) {
      await client.query(`UPDATE rooms SET status = 'finished' WHERE id = $1`, [
        roomId,
      ]);

      await client.query("COMMIT");
      return { action: "finished" };
    }

    const nextQuestion = nextQuestionResult.rows[0];

    await client.query(`UPDATE rooms SET status = 'question' WHERE id = $1`, [
      roomId,
    ]);

    const roundResult = await client.query(
      `INSERT INTO rounds (room_id, question_id, started_at, ends_at)
       VALUES ($1, $2, now(), now() + ($3 || ' seconds')::interval)
       RETURNING id, question_id, started_at, ends_at`,
      [roomId, nextQuestion.id, nextQuestion.duration_seconds],
    );

    const round = roundResult.rows[0];

    const optionsResult = await client.query(
      `SELECT id, text 
       FROM options 
       WHERE question_id = $1 
       ORDER BY position ASC`,
      [nextQuestion.id],
    );

    await client.query("COMMIT");

    return {
      action: "next_question",
      round: {
        id: round.id,
        number: nextQuestion.position,
        question: {
          id: nextQuestion.id,
          text: nextQuestion.text,
          options: optionsResult.rows,
        },
        endsAt: round.ends_at.toISOString(),
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
