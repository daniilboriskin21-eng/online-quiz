import { pool } from "./db.js";

try {
    const result = await pool.query(
        "SELECT current_database() AS database, current_user AS username"
    );

    console.table(result.rows);
} catch (error) {
    console.error("Не удалось подключиться к PostgreSQL:", error.message);
    process.exitCode = 1;
} finally {
    await pool.end();
}