import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDb } from "./config/db.js";
import { setSocketServer } from "./services/socketService.js";

const port = process.env.PORT || 5000;
const server = http.createServer(app);
const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: clientOrigins,
    credentials: true
  }
});

setSocketServer(io);

io.on("connection", (socket) => {
  socket.on("join:user", (userId) => socket.join(`user:${userId}`));
  socket.on("join:department", (department) => socket.join(`department:${department}`));
});

connectDb().then(() => {
  server.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
});
