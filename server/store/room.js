import { makeRoomCode } from "../utils/ids.js";

export const rooms = new Map(); // key: roomCode, value: roomObject

export function createEmptyRoom(hostPlayer) {
  let code;
  do code = makeRoomCode();
  while (rooms.has(code));

  // Initialize host player with empty cards
  hostPlayer.cards = [];

  const room = {
    code,
    createdAt: Date.now(),
    players: [hostPlayer], // max 4
    state: {
      phase: "lobby", // "in-game", "voting", "ended"
      turnIndex: 0,
      startedAt: null,
      currentPlayerIndex: null,
      centerWord: null,
      playedWords: [],
      scores: {}, // { playerId: score }
      settings: {
        cardCount: 7,
        allowVar: false,
      },
    },
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(String(code).toUpperCase());
}
