import { Server } from "socket.io";
import { getRoom, rooms } from "./store/room.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load word list for game
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const centerWordsPath = path.join(__dirname, "data", "center_top.txt");
const centerWords = fs
  .readFileSync(centerWordsPath, "utf-8")
  .split("\n")
  .map((w) => w.trim())
  .filter((w) => w.length > 0);
  const valid3Path = path.join(__dirname, "data", "center_3letters.txt");
  const valid3Set = new Set(
    fs
      .readFileSync(valid3Path, "utf-8")
      .split("\n")
      .map((w) => w.trim())
      .filter(Boolean),
  );
  
// Arabic letters for card generation
const AR_LETTERS = [
  "ا",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
  "ى",
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function makeCardId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function generatePlayerCards(count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const letterA = getRandomElement(AR_LETTERS);
    let letterB = getRandomElement(AR_LETTERS);
    while (letterB === letterA) letterB = getRandomElement(AR_LETTERS);

    cards.push({ id: makeCardId(), letterA, letterB });
  }
  return cards;
}

function drawCardFromDeck() {
  return generatePlayerCards(1)[0];
}


function nextPlayerIndex(room, currentIndex) {
  const n = room.players.length;
  if (n === 0) return 0;
  return (currentIndex + 1) % n;
}
function getPlayerBySocket(room, socketId) {
  return room.players.find((p) => p.socketId === socketId);
}

function requireHost(room, socketId) {
  const actor = getPlayerBySocket(room, socketId);
  return actor && actor.isHost;
}

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

      if(!requireHost(room,socket.id)) return;
      // Store settings in room state
      room.state.settings = settings;

      // Broadcast settings update to all players in the room
      io.to(roomCode).emit("room:settings-update", { settings });
    });

    socket.on("room:remove-player", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      if(!requireHost(room,socket.id)) return;
      // Find the player to remove
      const playerIndex = room.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return;

      if (room.state.phase === "in-game") {
        // If the person who left was BEFORE the current player, shift index left
        if (playerIndex < room.state.currentPlayerIndex) {
          room.state.currentPlayerIndex--;
        } 
        // If the person who left WAS the current player, pass the turn
        else if (playerIndex === room.state.currentPlayerIndex) {
          // Wrap around logic for the new array length (which will be length - 1)
          const newLength = room.players.length - 1;
          room.state.currentPlayerIndex = newLength > 0 ? playerIndex % newLength : 0;
          room.state.turnStartedAt = Date.now(); // Reset timer for the "new" active player
        }
      }
      const removedPlayer = room.players[playerIndex];

      // Remove the player from the room
      room.players.splice(playerIndex, 1);

      // Send notification to the removed player to go back to home
      if (removedPlayer.socketId) {
        io.to(removedPlayer.socketId).emit("room:player-removed");
        io.sockets.sockets.get(removedPlayer.socketId)?.leave(room.code);
      }

      // Broadcast room update to remaining players
      io.to(roomCode).emit("room:update", { room });
    });

    socket.on("room:promote-to-host", ({ roomCode, playerId }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      //only the host can do it
      if(!requireHost(room,socket.id)) return;
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

      if (room.state.phase === "in-game") {
        // If the person who left was BEFORE the current player, shift index left
        if (playerIndex < room.state.currentPlayerIndex) {
          room.state.currentPlayerIndex--;
        } 
        // If the person who left WAS the current player, pass the turn
        else if (playerIndex === room.state.currentPlayerIndex) {
          // Wrap around logic for the new array length (which will be length - 1)
          const newLength = room.players.length - 1;
          room.state.currentPlayerIndex = newLength > 0 ? playerIndex % newLength : 0;
          room.state.turnStartedAt = Date.now(); // Reset timer for the "new" active player
        }
      }

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

    socket.on("room:start-game", ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) return;

      if(!requireHost(room,socket.id)) return;
      // Get card count from settings (default: 7)
      const cardCount = room.state.settings?.startingCards || 7;

      // Generate cards for each player
      room.players.forEach((player) => {
        player.cards = generatePlayerCards(cardCount);
      });

      // Pick random center word
      const centerWord = getRandomElement(centerWords);

      // Pick random starting player
      const startingPlayerIndex = Math.floor(
        Math.random() * room.players.length,
      );

      // Update room state
      room.state.phase = "in-game";
      const now = Date.now();
      room.state.startedAt = now;
      // Track when the current turn started; used for frontend timers
      room.state.turnStartedAt = now;
      room.state.currentPlayerIndex = startingPlayerIndex;
      room.state.centerWord = centerWord;
      room.state.playedWords = [];
      

      // Broadcast game start to all players
      io.to(roomCode).emit("room:update", { room });
      io.to(roomCode).emit("game:started", {
        centerWord,
        currentPlayerIndex: startingPlayerIndex,
      });
    });

    socket.on("room:play-card", (payload, ack) => {
      try {
        const { roomCode, playerId, cardIndex, pick, targetIndex,currentWord } = payload || {};
        const room = getRoom(roomCode);
        if (!room) return ack?.({ ok: false, error: "Room not found" });
    
        if (room.state.phase !== "in-game") {
          return ack?.({ ok: false, error: "Game is not running" });
        }

        if (currentWord && room.state.centerWord !== currentWord) {
          // If the client thinks the word is "CAT" but server says "BAT", reject the move
          return ack?.({ ok: false, error: "Game state updated. Please refresh." });
        }
        
        if (room.state.currentPlayerIndex >= room.players.length) {
          room.state.currentPlayerIndex = 0;
        }
    
        const currentPlayer = room.players[room.state.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== playerId) {
          return ack?.({ ok: false, error: "Not your turn" });
        }
        
    
        const player = room.players.find((p) => p.id === playerId);
        if (!player) return ack?.({ ok: false, error: "Player not found" });
    
        if (!Array.isArray(player.cards)) player.cards = [];
    
        if (typeof cardIndex !== "number" || cardIndex < 0 || cardIndex >= player.cards.length) {
          return ack?.({ ok: false, error: "Invalid cardIndex" });
        }
    
        const centerWord = String(room.state.centerWord || "");
        if (!centerWord) return ack?.({ ok: false, error: "No center word" });
    
        if (typeof targetIndex !== "number" || targetIndex < 0 || targetIndex >= centerWord.length) {
          return ack?.({ ok: false, error: "Invalid targetIndex" });
        }
    
        const card = player.cards[cardIndex];
        const chosenLetter = pick === "B" ? card.letterB : card.letterA;
    
        // Build new word by replacing one letter in center word
        const chars = [...centerWord];
        chars[targetIndex] = chosenLetter;
        const newWord = chars.join("");
    
        const isValid = valid3Set.has(newWord);
    
        //تاريخ اللعب
        room.state.playedWords ||= [];
    
        if (!isValid) {
          // ❌ Invalid move:
          // - card returns to player (do NOT remove)
          // - player draws a new card from deck
          player.cards.push(drawCardFromDeck());
    
          room.state.playedWords.push({
            ok: false,
            playerId,
            at: Date.now(),
            centerWordBefore: centerWord,
            attempt: { card, pick: pick === "B" ? "B" : "A", targetIndex, newWord },
          });
    
          // pass the turn anyway
          const now = Date.now();
          room.state.currentPlayerIndex = nextPlayerIndex(room, room.state.currentPlayerIndex);
          room.state.turnStartedAt = now;
    
          io.to(roomCode).emit("room:update", { room });
          io.to(socket.id).emit("game:invalid-move", { newWord });
    
          return ack?.({ ok: true, valid: false, newWord });
        }
    
        // ✅ Valid move:
        // - consume card (remove from hand)
        player.cards.splice(cardIndex, 1);
        // - update center word
        room.state.centerWord = newWord;
        
        if (player.cards.length === 0) {
          room.state.phase = "game-over";
          room.state.winner = playerId;
          io.to(roomCode).emit("room:update", { room });
          io.to(roomCode).emit("game:ended", { winnerId: playerId });
          return ack?.({ ok: true, valid: true, newWord, win: true });
        }
       
    
        room.state.playedWords.push({
          ok: true,
          playerId,
          at: Date.now(),
          centerWordBefore: centerWord,
          centerWordAfter: newWord,
          move: { card, pick: pick === "B" ? "B" : "A", targetIndex },
        });
    
        // next turn
        const now = Date.now();
        room.state.currentPlayerIndex = nextPlayerIndex(room, room.state.currentPlayerIndex);
        room.state.turnStartedAt = now;
    
        io.to(roomCode).emit("room:update", { room });
        io.to(roomCode).emit("game:move-applied", {
          playerId,
          newWord,
          targetIndex,
          pick: pick === "B" ? "B" : "A",
          turnStartedAt: now,
          currentPlayerIndex: room.state.currentPlayerIndex,
        });
    
        return ack?.({ ok: true, valid: true, newWord });
      } catch (e) {
        return ack?.({ ok: false, error: "Unexpected server error" });
      }
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

  
  const TURN_TICK_MS = 500;
  
  setInterval(() => {
    const now = Date.now();
  
    for (const room of rooms.values()) {
      if (!room?.state) continue;
      if (room.state.phase !== "in-game") continue;
      if (!room.state.turnStartedAt) continue;
  
      const timePerTurn = room.state.settings?.timePerTurn ?? 30;
      const elapsedMs = now - room.state.turnStartedAt;
  
      if (elapsedMs < timePerTurn * 1000) continue;
  
      // TIMEOUT: current player draws a card + turn advances
      const idx = room.state.currentPlayerIndex ?? 0;
      const player = room.players[idx];
  
      if (player) {
        player.cards ||= [];
        player.cards.push(drawCardFromDeck());
      }
  
      room.state.playedWords ||= [];
      room.state.playedWords.push({
        ok: false,
        type: "timeout",
        playerId: player?.id ?? null,
        at: now,
      });
  
      room.state.currentPlayerIndex = nextPlayerIndex(room, idx);
      room.state.turnStartedAt = now;
  
      io.to(room.code).emit("room:update", { room });
      io.to(room.code).emit("game:turn-timeout", {
        timedOutPlayerId: player?.id ?? null,
        nextPlayerIndex: room.state.currentPlayerIndex,
        turnStartedAt: now,
      });
    }
  }, TURN_TICK_MS);
  
  return io;
}
