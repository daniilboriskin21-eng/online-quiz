import { pool } from "./db.js";
import { createRoom } from "./rooms.js";

try {
  const quizzes = await pool.query(
    "SELECT id FROM quizzes WHERE title = $1",
    ["Кино"]
  );

  if (quizzes.rows.length !== 1) {
    throw new Error("Ожидался один квиз с названием «Кино»");
  }

  const { room, member } = await createRoom(quizzes.rows[0].id);

  console.table([room]);
  console.table([member]);
} catch (error) {
  console.error("Ошибка проверки создания комнаты:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}