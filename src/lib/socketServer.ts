import type { Server as HttpServer } from "http";
import type { NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

export type RealtimeEventName =
  | "serviceRequestCreated"
  | "serviceUpdated"
  | "servicePreview"
  | "adminNoteAdded"
  | "documentsUpdated"
  | "consultantRegistered"
  | "consultantStatusUpdated"
  | "appointmentSlotUpdated"
  | "appointmentUpdated";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io?: IOServer;
    };
  };
};

declare global {
  // eslint-disable-next-line no-var
  var __NCJ_IO__: IOServer | undefined;
}

function getUserRoom(userId: string) {
  return `user:${userId}`;
}

function getAdminRoom() {
  return "admin:dashboard";
}

export function getUserRoomName(userId: string) {
  return getUserRoom(userId);
}

export function getAdminRoomName() {
  return getAdminRoom();
}

export function getSocketServer() {
  return global.__NCJ_IO__ ?? null;
}

export function setSocketServer(io: IOServer) {
  global.__NCJ_IO__ = io;
}

export function attachSocketServerToResponse(
  response: NextApiResponseWithSocket,
  io: IOServer
) {
  response.socket.server.io = io;
}

export function emitToUserRoom(
  userId: string,
  event: RealtimeEventName,
  payload: Record<string, unknown>
) {
  const io = getSocketServer();

  if (!io) {
    return false;
  }

  io.to(getUserRoom(userId)).emit(event, payload);
  return true;
}

export function emitToAdminRoom(
  event: RealtimeEventName,
  payload: Record<string, unknown>
) {
  const io = getSocketServer();

  if (!io) {
    return false;
  }

  io.to(getAdminRoom()).emit(event, payload);
  return true;
}
