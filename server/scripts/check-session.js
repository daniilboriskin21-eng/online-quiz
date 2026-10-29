import { pool } from "../db/index.js";
import { findSessionByToken } from "../services/session.service.js";
import { createRoom } from "../services/room.service.js";

try {
  // 1. Проверяем несуществующий токен и некорректный ввод
  const nullResult = await findSessionByToken(null);
  const fakeResult = await findSessionByToken("fake-token-that-does-not-exist");

  if (nullResult !== null || fakeResult !== null) {
    throw new Error("Несуществующий токен должен возвращать null");
  }
  console.log("Проверка невалидных токенов пройдена (вернулся null)");

  // 2. Берём квиз «Кино» и создаем тестовую комнату
  const quizzes = await pool.query("SELECT id FROM quizzes WHERE title = $1", [
    "Кино",
  ]);

  if (quizzes.rows.length !== 1) {
    throw new Error("Ожидался один квиз с названием «Кино»");
  }

  const { room, member, token } = await createRoom(quizzes.rows[0].id);

  // 3. Проверяем поиск созданной сессии по живому токену
  const session = await findSessionByToken(token);

  console.log("Результат поиска активной сессии:");
  console.table([session]);

  if (
    session &&
    session.id === member.id &&
    session.room_code === room.code &&
    session.role === "host" &&
    session.is_active === true &&
    session.is_expired === false &&
    session.is_revoked === false
  ) {
    console.log(
      "Успех: сессия найдена, данные совпали, флаги активности корректны!",
    );
  } else {
    throw new Error("Данные сессии не совпали с ожидаемыми");
  }
} catch (error) {
  console.error("Ошибка проверки сессии:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
