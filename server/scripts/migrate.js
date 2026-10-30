import fs from "node:fs";
import path from "node:path";
import { pool } from "../db/index.js";

const file = process.argv[2] || "sql/013_add_text_questions.sql";
const fullPath = path.isAbsolute(file)
  ? file
  : path.resolve(process.cwd(), file);

try {
  console.log(`Применяем миграцию: ${fullPath}`);
  const sql = fs.readFileSync(fullPath, "utf-8");
  await pool.query(sql);
  console.log("✓ Миграция успешно применена!");
} catch (error) {
  console.error("Ошибка при выполнении миграции:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
