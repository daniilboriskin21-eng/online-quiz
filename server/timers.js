import { pool } from "./db.js";
import { closeCurrentRound } from "./game.js";

const roomTimers = new Map(); // roomId -> Timeout

export function scheduleRoundTimer(
  roomId,
  roomCode,
  roundId,
  endsAtIso,
  onExpired,
) {
  if (roomTimers.has(roomId)) {
    clearTimeout(roomTimers.get(roomId));
    roomTimers.delete(roomId);
  }

  const delayMs = Math.max(0, new Date(endsAtIso).getTime() - Date.now());

  const timer = setTimeout(async () => {
    try {
      await closeCurrentRound(roomId, roundId);
      roomTimers.delete(roomId);
      if (typeof onExpired === "function") {
        await onExpired(roomId, roomCode);
      }
    } catch (error) {
      console.error(
        `Ошибка при автозакрытии раунда ${roundId}:`,
        error.message,
      );
    }
  }, delayMs);

  roomTimers.set(roomId, timer);
}

export function clearRoundTimer(roomId) {
  if (roomTimers.has(roomId)) {
    clearTimeout(roomTimers.get(roomId));
    roomTimers.delete(roomId);
  }
}

export async function recoverActiveRounds(onExpired) {
  try {
    const activeRoundsResult = await pool.query(
      `SELECT r.id AS room_id, r.code AS room_code, rd.id AS round_id, rd.ends_at
       FROM rooms r
       JOIN rounds rd ON rd.room_id = r.id
       WHERE r.status = 'question' AND rd.closed_at IS NULL`,
    );

    for (const row of activeRoundsResult.rows) {
      const delayMs = new Date(row.ends_at).getTime() - Date.now();

      if (delayMs <= 0) {
        await closeCurrentRound(row.room_id, row.round_id);
        console.log(
          `[Recovery] Закрыт просроченный раунд ${row.round_id} в комнате ${row.room_code}`,
        );
      } else {
        scheduleRoundTimer(
          row.room_id,
          row.room_code,
          row.round_id,
          row.ends_at.toISOString(),
          onExpired,
        );
        console.log(
          `[Recovery] Восстановлен таймер раунда ${row.round_id} в комнате ${row.room_code} (осталось ${Math.round(delayMs / 1000)} сек)`,
        );
      }
    }
  } catch (error) {
    console.error("Ошибка восстановления раундов при старте:", error.message);
  }
}
