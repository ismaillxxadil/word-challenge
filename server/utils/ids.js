import crypto from "crypto";

export function makePlayerId() {
  return crypto.randomUUID();
}

export function makeRoomCode() {
  // 4 chars مثل A1B2
  return crypto.randomBytes(2).toString("hex").toUpperCase();
}
