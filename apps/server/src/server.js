import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN, credentials: true },
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
