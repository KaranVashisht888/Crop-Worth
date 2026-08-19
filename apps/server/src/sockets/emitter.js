let ioInstance = null;

export function setIO(io) {
  ioInstance = io;
}

export function emitToListing(listingId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`listing:${listingId}`).emit(event, payload);
}
