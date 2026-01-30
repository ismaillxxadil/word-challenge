import { Server } from "socket.io";
import { getRoom, rooms } from "./store/room.js";

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

    socket.on("room:change-settings", ({ roomCode, settings }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      // Store settings in room state
      room.state.settings = settings;

      // Broadcast settings update to all players in the room
      io.to(roomCode).emit("room:settings-update", { settings });
    });

    socket.on("room:remove-player", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      // Find the player to remove
      const playerIndex = room.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return;

      const removedPlayer = room.players[playerIndex];

      // Remove the player from the room
      room.players.splice(playerIndex, 1);

      // Send notification to the removed player to go back to home
      if (removedPlayer.socketId) {
        io.to(removedPlayer.socketId).emit("room:player-removed");
      }

      // Broadcast room update to remaining players
      io.to(roomCode).emit("room:update", { room });
    });

    socket.on("room:promote-to-host", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      // Find the current host and the player to promote
      const currentHost = room.players.find((p) => p.isHost);
      const playerToPromote = room.players.find((p) => p.id === playerId);

      if (!playerToPromote) return;

      // Demote current host if exists
      if (currentHost) {
        currentHost.isHost = false;
      }

      // Promote the selected player to host
      playerToPromote.isHost = true;

      // Broadcast room update to all players
      io.to(roomCode).emit("room:update", { room });
    });

    socket.on("room:leave", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      // Find the player leaving
      const playerIndex = room.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return;

      const leavingPlayer = room.players[playerIndex];
      const wasHost = leavingPlayer.isHost;

      // Remove the player from the room
      room.players.splice(playerIndex, 1);

      // If the leaving player was the host and there are remaining players
      if (wasHost && room.players.length > 0) {
        // Make the first remaining player the new host
        room.players[0].isHost = true;
      }

      // If room is empty, you could delete it
      if (room.players.length === 0) {
        rooms.delete(roomCode);
      }

      // Broadcast room update to remaining players
      io.to(roomCode).emit("room:update", { room });
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
