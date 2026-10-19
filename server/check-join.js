import { pool } from "./db.js";
import { createRoom, joinRoom } from "./rooms.js";

try {
  // 1. Проверка валидации
  try {
    await joinRoom("123", "Алиса");
    throw new Error("Ожидалась ошибка короткого кода");
  } catch (err) {
    if (err.code !== "VALIDATION_ERROR") throw err;
    console.log("✓ Проверка невалидного кода пройдена");
  }

  try {
    await joinRoom("ABCDEF", "   ");
    throw new Error("Ожидалась ошибка пустого имени");
  } catch (err) {
    if (err.code !== "VALIDATION_ERROR") throw err;
    console.log("✓ Проверка пустого никнейма пройдена");
  }

  // 2. Проверка несуществующей комнаты
  try {
    await joinRoom("ZZZZZZ", "Алиса");
    throw new Error("Ожидалась ошибка несуществующей комнаты");
  } catch (err) {
    if (err.code !== "ROOM_NOT_FOUND") throw err;
    console.log("✓ Проверка несуществующей комнаты пройдена");
  }

  // 3. Создаем комнату для тестов
  const quizzes = await pool.query(
    "SELECT id FROM quizzes WHERE title = $1",
    ["Кино"]
  );
  const { room } = await createRoom(quizzes.rows[0].id);
  console.log(`✓ Создана тестовая комната: ${room.code}`);

  // 4. Первый игрок входит
  const player1 = await joinRoom(room.code, "Алиса");
  if (player1.member.role !== "player" || player1.member.nickname !== "Алиса") {
    throw new Error("Данные первого игрока некорректны");
  }
  console.log("✓ Игрок «Алиса» успешно вошел (роль player)");

  // 5. Проверка занятого имени (в нижнем регистре!)
  try {
    await joinRoom(room.code, "алиса");
    throw new Error("Ожидалась ошибка NICKNAME_TAKEN");
  } catch (err) {
    if (err.code !== "NICKNAME_TAKEN") throw err;
    console.log("✓ Занятый никнейм «алиса» в нижнем регистре успешно отклонён");
  }

  // 6. Второй игрок входит
  const player2 = await joinRoom(room.code, "Борис");
  if (player2.member.role !== "player" || player2.member.nickname !== "Борис") {
    throw new Error("Данные второго игрока некорректны");
  }
  console.log("✓ Игрок «Борис» успешно вошел");

  console.log("\nВсе проверки функции joinRoom успешно пройдены!");
} catch (error) {
  console.error("Ошибка при проверке joinRoom:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}