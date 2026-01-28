import { makeRoomCode } from "../utils/ids.js";

export const rooms = new Map(); // key: roomCode, value: roomObject

export function createEmptyRoom(hostPlayer) {
  let code;
  do code = makeRoomCode();
  while (rooms.has(code));

  const room = {
    code,
    createdAt: Date.now(),
    players: [hostPlayer], // max 4
    state: {
      phase: "lobby", // later: "playing", "voting", "ended"
      turnIndex: 0,
      startedAt: null,
    },
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(String(code).toUpperCase());
}
