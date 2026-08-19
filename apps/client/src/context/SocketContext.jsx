import { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../api/client.js";

const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    return () => socketRef.current?.disconnect();
  }, []);

  return <SocketContext.Provider value={socketRef}>{children}</SocketContext.Provider>;
}

// Joins a listing's room for the lifetime of the calling component and wires
// up the given event handlers; handles are re-bound if they change identity.
export function useListingSocket(listingId, handlers) {
  const socketRef = useContext(SocketContext);

  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket || !listingId) return;

    socket.emit("listing:join", listingId);
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
      socket.emit("listing:leave", listingId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, socketRef, ...Object.values(handlers)]);
}
