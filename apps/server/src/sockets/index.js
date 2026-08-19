// Bid placement/acceptance still goes through the authenticated REST API;
// sockets are a read-only broadcast layer, so no socket-level auth needed -
// joining a room only lets a client watch a listing's public bid activity.
export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    socket.on("listing:join", (listingId) => {
      if (typeof listingId === "string") socket.join(`listing:${listingId}`);
    });

    socket.on("listing:leave", (listingId) => {
      if (typeof listingId === "string") socket.leave(`listing:${listingId}`);
    });
  });
}
