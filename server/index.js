import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import roomRouter from "./routes/room.js";
import dictionaryRouter from "./routes/dictionary.js";
import { setupSocket } from "./socket.js";
import { rooms } from "./store/room.js";

const app = express();

console.log(process.env.CLIENT_URL, process.env.NGROK_URL);

// Apply production middleware
app.use(helmet());
app.use(compression());

// Define rate limiting rules
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10kb" })); // Limit JSON body to 10KB
app.use("/room", roomRouter);
app.use("/dictionary", dictionaryRouter);

// Health Check Endpoint
app.get("/health", (req, res) => {
  const activeRooms = [];
  let totalPlayers = 0;

  for (const [code, room] of rooms.entries()) {
    activeRooms.push({
      players: room.players.length,
      phase: room.state.phase,
      lastActivity: room.lastActivity,
    });
    totalPlayers += room.players.length;
  }

  res.json({
    status: "ok",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    activeRoomsCount: rooms.size,
    totalPlayers,
    activeRooms,
  });
});

// 👇 create HTTP server from Express
const httpServer = http.createServer(app);

// 👇 attach Socket.IO
setupSocket(httpServer);

const PORT = process.env.PORT || 4000;

// 👇 listen using httpServer (NOT app.listen)
httpServer.listen(PORT, () => {
  console.log(`API + Socket running on http://localhost:${PORT}`);
});
