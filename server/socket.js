import { Server } from "socket.io";
import { getRoom, rooms } from "./store/roomStore.js";

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "http://localhost:3000", credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on("room:join", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room)
        return socket.emit("room:error", { message: "Room not found" });

      const player = room.players.find((p) => p.id === playerId);
      if (!player)
        return socket.emit("room:error", { message: "Player not found" });

      player.socketId = socket.id;
      socket.join(room.code);

      // send snapshot to the joining socket
      socket.emit("room:snapshot", { room });

      // broadcast update to everyone
      io.to(room.code).emit("room:update", { room });
    });

    socket.on("disconnect", () => {
      for (const room of rooms.values()) {
        const p = room.players.find((x) => x.socketId === socket.id);
        if (p) {
          p.socketId = null;
          io.to(room.code).emit("room:update", { room });
          break;
        }
      }
    });
  });

  return io;
}
