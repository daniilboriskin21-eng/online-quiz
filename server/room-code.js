import { randomInt } from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const codeLength = 6;

export function generateRoomCode() {
  let code = "";

  for (let i = 0; i < codeLength; i++) {
    const index = randomInt(alphabet.length);
    code += alphabet[index];
  }

  return code;
}
