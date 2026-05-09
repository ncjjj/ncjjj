import { io, type Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export async function getUserSocketClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (socketInstance) {
    return socketInstance;
  }

  await fetch("/api/socket", { method: "GET", cache: "no-store" });

  socketInstance = io({
    path: "/api/socket/io",
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
  });

  return socketInstance;
}
