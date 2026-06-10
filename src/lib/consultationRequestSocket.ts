import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { getPublicAppUrl } from "./env";

type RequestSocketServer = SocketIOServer | undefined;

declare global {
  // eslint-disable-next-line no-var
  var consultationRequestSocketServer: RequestSocketServer;
}

type RequestSocketPayload = {
  request: {
    id: string;
    email: string;
    status: string;
    serviceName: string;
    fullName: string;
    createdAt: string;
  };
  type: "created" | "updated";
};

const REQUEST_ROOM_PREFIX = "consultation-request";

export function getConsultationRequestRoomKey(email: string) {
  return `${REQUEST_ROOM_PREFIX}:${email.trim().toLowerCase()}`;
}

export function ensureConsultationRequestSocketServer(server: HttpServer) {
  if (!globalThis.consultationRequestSocketServer) {
    const appOrigin = getPublicAppUrl();
    const io = new SocketIOServer(server, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? [appOrigin]
            : [appOrigin, "http://localhost:3000", "http://127.0.0.1:3000"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      const email = typeof socket.handshake.query.email === "string"
        ? socket.handshake.query.email.trim().toLowerCase()
        : "";

      if (email) {
        socket.join(getConsultationRequestRoomKey(email));
        socket.join(`user:${email}`);
      }

      const isAdmin = socket.handshake.query.isAdmin === "true";
      if (isAdmin) {
        socket.join("admin-room");
      }

      socket.on("join-consultation-request-room", (payload: { email?: string } | undefined) => {
        const roomEmail = payload?.email?.trim().toLowerCase();

        if (!roomEmail) {
          return;
        }

        socket.join(getConsultationRequestRoomKey(roomEmail));
        socket.join(`user:${roomEmail}`);
      });
    });

    globalThis.consultationRequestSocketServer = io;
  }

  return globalThis.consultationRequestSocketServer;
}

export function emitConsultationRequestEvent(email: string, payload: RequestSocketPayload) {
  globalThis.consultationRequestSocketServer?.to(getConsultationRequestRoomKey(email)).emit(
    "consultation-request-updated",
    payload
  );
}

export function emitAdminEvent(type: string, data: any) {
  globalThis.consultationRequestSocketServer?.to("admin-room").emit("admin-update", {
    type,
    data,
  });
}

export function emitUserEvent(email: string, type: string, data: any) {
  const normalizedEmail = email.trim().toLowerCase();
  globalThis.consultationRequestSocketServer?.to(`user:${normalizedEmail}`).emit("user-update", {
    type,
    data,
  });
}
