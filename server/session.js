import { randomBytes, createHash } from "node:crypto";
import { pool } from "./db.js";

export async function findSessionByToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const result = await pool.query(
    `SELECT
       m.id,
       m.room_id,
       m.role,
       m.nickname,
       m.session_expires_at,
       m.session_revoked_at,
       r.code AS room_code,
       r.status AS room_status,
       (m.session_revoked_at IS NOT NULL) AS is_revoked,
       (m.session_expires_at <= now()) AS is_expired
     FROM members m
     JOIN rooms r ON r.id = m.room_id
     WHERE m.session_token_hash = $1`,
    [tokenHash],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const session = result.rows[0];

  return {
    ...session,
    is_active: !session.is_revoked && !session.is_expired,
  };
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
