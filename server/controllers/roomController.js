import { z } from "zod";
import { makePlayerId } from "../utils/ids.js";
import { createEmptyRoom, getRoom } from "../store/room.js";

const createRoomSchema = z.object({
  name: z.string().trim().min(1).max(20).optional(),
});

const joinSchema = z.object({
  name: z.string().trim().min(1).max(20),
});
export async function createRoom(req, res) {
  try {
    const body = createRoomSchema.parse(req.body);

    const hostPlayer = {
      id: makePlayerId(),
      name: body.name ?? "Host",
      isHost: true,
      joinedAt: Date.now(),
      socketId: null, // we’ll fill it when socket joins
    };

    const room = createEmptyRoom(hostPlayer);

    return res.status(201).json({
      ok: true,
      roomCode: room.code,
      playerId: hostPlayer.id,
      room, // ممكن تشيله لاحقًا وترجع snapshot أصغر
    });
  } catch (err) {
    return res.status(400).json({
      ok: false,
      error: err?.message ?? "Bad Request",
    });
  }
}

export function joinRoom(req, res) {
  try {
    const code = String(req.params.code).toUpperCase();
    const room = getRoom(code);
    if (!room)
      return res.status(404).json({ ok: false, error: "Room not found" });

    /* if (room.players.length >= 4) {
      return res.status(403).json({ ok: false, error: "Room is full" });
    } */

    const body = joinSchema.parse(req.body);

    const player = {
      id: makePlayerId(),
      name: body.name,
      isHost: false,
      joinedAt: Date.now(),
      socketId: null,
      cards: [],
    };

    room.players.push(player);

    return res.status(201).json({
      ok: true,
      roomCode: room.code,
      playerId: player.id,
      room,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ ok: false, error: err?.message ?? "Bad Request" });
  }
}
