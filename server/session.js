import { randomBytes, createHash } from "node:crypto";

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
