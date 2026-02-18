import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";

import roomRouter from "./routes/room.js";
import { setupSocket } from "./socket.js";

const app = express();

app.use(cors({ origin: ["http://localhost:3000",process.env.CLIENT_URL], credentials: true }));
app.use(express.json());
app.use("/room", roomRouter);

// 👇 create HTTP server from Express
const httpServer = http.createServer(app);

// 👇 attach Socket.IO
setupSocket(httpServer);

const PORT = process.env.PORT || 4000;

// 👇 listen using httpServer (NOT app.listen)
httpServer.listen(PORT, () => {
  console.log(`API + Socket running on http://localhost:${PORT}`);
});
