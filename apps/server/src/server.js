import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { setIO } from "./sockets/emitter.js";
import { registerSocketHandlers } from "./sockets/index.js";
import { startAuctionExpiryJob } from "./jobs/auctionExpiry.js";

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN, credentials: true },
});

setIO(io);
registerSocketHandlers(io);
startAuctionExpiryJob();

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
