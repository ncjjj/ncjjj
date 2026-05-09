import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { getToken } from "next-auth/jwt";
import { Server as IOServer } from "socket.io";
import {
  attachSocketServerToResponse,
  getAdminRoomName,
  emitToAdminRoom,
  emitToUserRoom,
  getSocketServer,
  getUserRoomName,
  setSocketServer,
} from "../../lib/socketServer";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "../../lib/adminAuth";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: IOServer;
    };
  };
};

type JoinUserRoomPayload = {
  userId?: string;
};

type PreviewServiceUpdatePayload = {
  requestId?: string;
  userId?: string;
  status?: "pending" | "approved" | "rejected";
  adminRemarks?: string | null;
  paymentStatus?: "pending" | "received";
  paymentNote?: string | null;
};

type AppointmentSlotUpdatedPayload = {
  eventId?: string;
  slotId?: string;
  userId?: string | null;
  slotDate?: string;
  slotStartTime?: string;
  status?: "available" | "selected" | "confirmed";
  selectedByUserId?: string | null;
  occurredAt?: string;
};

type AppointmentUpdatedPayload = {
  eventId?: string;
  appointmentId?: string;
  slotId?: string;
  userId?: string;
  status?: "pending" | "approved" | "rejected" | "cancelled";
  adminAction?: string | null;
  adminRemarks?: string | null;
  occurredAt?: string;
};

type SocketAuthContext = {
  mode: "user" | "admin";
  userId?: string;
};

function parseCookieValue(rawCookieHeader: string | undefined, cookieName: string): string {
  if (!rawCookieHeader) {
    return "";
  }

  const segments = rawCookieHeader.split(";");

  for (const segment of segments) {
    const [rawKey, ...rawValueParts] = segment.trim().split("=");

    if (rawKey !== cookieName) {
      continue;
    }

    return rawValueParts.join("=");
  }

  return "";
}

function getSocketUserId(socketRequest: NextApiRequest) {
  const requestWithUser = socketRequest as NextApiRequest & {
    user?: {
      id?: string;
    };
  };

  return requestWithUser.user?.id ?? "";
}

function getSocketAuthContext(socketRequest: NextApiRequest): SocketAuthContext {
  const requestWithAuth = socketRequest as NextApiRequest & {
    auth?: SocketAuthContext;
  };

  return requestWithAuth.auth || { mode: "user" };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const response = res as NextApiResponseWithSocket;

  if (response.socket.server.io) {
    if (!getSocketServer()) {
      setSocketServer(response.socket.server.io);
    }

    res.status(200).json({ ok: true, reused: true });
    return;
  }

  const io = new IOServer(response.socket.server as any, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.request.headers.cookie;
      const adminToken = parseCookieValue(cookieHeader, ADMIN_SESSION_COOKIE);
      const adminSession = verifyAdminSessionToken(adminToken || null);

      if (adminSession) {
        (socket.request as NextApiRequest & { auth?: SocketAuthContext }).auth = {
          mode: "admin",
        };
        next();
        return;
      }

      const secret = process.env.NEXTAUTH_SECRET;

      if (!secret) {
        next(new Error("Unauthorized"));
        return;
      }

      const token = await getToken({
        req: socket.request as NextApiRequest,
        secret,
      });

      const tokenUserId = typeof token?.id === "string" ? token.id : "";

      if (!tokenUserId) {
        next(new Error("Unauthorized"));
        return;
      }

      (socket.request as NextApiRequest & { user?: { id: string } }).user = {
        id: tokenUserId,
      };
      (socket.request as NextApiRequest & { auth?: SocketAuthContext }).auth = {
        mode: "user",
        userId: tokenUserId,
      };

      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const authContext = getSocketAuthContext(socket.request as NextApiRequest);

    if (authContext.mode === "admin") {
      socket.join(getAdminRoomName());

      socket.on("previewServiceUpdate", (payload: PreviewServiceUpdatePayload) => {
        const requestId = typeof payload?.requestId === "string" ? payload.requestId : "";
        const userId = typeof payload?.userId === "string" ? payload.userId : "";
        const status =
          payload?.status === "approved" || payload?.status === "rejected"
            ? payload.status
            : "pending";
        const paymentStatus = payload?.paymentStatus === "received" ? "received" : "pending";
        const adminRemarks =
          typeof payload?.adminRemarks === "string" ? payload.adminRemarks : null;
        const paymentNote =
          typeof payload?.paymentNote === "string" ? payload.paymentNote : null;

        if (!requestId || !userId) {
          return;
        }

        emitToUserRoom(userId, "servicePreview", {
          eventId: randomUUID(),
          requestId,
          userId,
          status,
          adminRemarks,
          paymentStatus,
          paymentNote,
          occurredAt: new Date().toISOString(),
        });
      });

      socket.on("appointmentSlotUpdated", (payload: AppointmentSlotUpdatedPayload) => {
        const slotId = typeof payload?.slotId === "string" ? payload.slotId : "";
        const status =
          payload?.status === "selected" || payload?.status === "confirmed"
            ? payload.status
            : "available";

        if (!slotId) {
          return;
        }

        emitToAdminRoom("appointmentSlotUpdated", {
          eventId: payload?.eventId || randomUUID(),
          slotId,
          userId: typeof payload?.userId === "string" ? payload.userId : null,
          slotDate: typeof payload?.slotDate === "string" ? payload.slotDate : "",
          slotStartTime: typeof payload?.slotStartTime === "string" ? payload.slotStartTime : "",
          status,
          selectedByUserId:
            typeof payload?.selectedByUserId === "string" ? payload.selectedByUserId : null,
          occurredAt: payload?.occurredAt || new Date().toISOString(),
        });
      });

      socket.on("appointmentUpdated", (payload: AppointmentUpdatedPayload) => {
        const appointmentId = typeof payload?.appointmentId === "string" ? payload.appointmentId : "";
        const userId = typeof payload?.userId === "string" ? payload.userId : "";
        const status =
          payload?.status === "approved" ||
          payload?.status === "rejected" ||
          payload?.status === "cancelled"
            ? payload.status
            : "pending";

        if (!appointmentId || !userId) {
          return;
        }

        emitToAdminRoom("appointmentUpdated", {
          eventId: payload?.eventId || randomUUID(),
          appointmentId,
          slotId: typeof payload?.slotId === "string" ? payload.slotId : "",
          userId,
          status,
          adminAction: payload?.adminAction ?? null,
          adminRemarks: payload?.adminRemarks ?? null,
          occurredAt: payload?.occurredAt || new Date().toISOString(),
        });

        emitToUserRoom(userId, "appointmentUpdated", {
          eventId: payload?.eventId || randomUUID(),
          appointmentId,
          slotId: typeof payload?.slotId === "string" ? payload.slotId : "",
          userId,
          status,
          adminAction: payload?.adminAction ?? null,
          adminRemarks: payload?.adminRemarks ?? null,
          occurredAt: payload?.occurredAt || new Date().toISOString(),
        });
      });

      return;
    }

    const socketUserId = getSocketUserId(socket.request as NextApiRequest);

    if (!socketUserId) {
      socket.disconnect(true);
      return;
    }

    socket.join(getUserRoomName(socketUserId));

    socket.on("joinUserRoom", (payload: JoinUserRoomPayload) => {
      const requestedUserId = typeof payload?.userId === "string" ? payload.userId : "";

      if (!requestedUserId || requestedUserId !== socketUserId) {
        return;
      }

      socket.join(getUserRoomName(requestedUserId));
    });
  });

  setSocketServer(io);
  attachSocketServerToResponse(response as any, io);

  res.status(200).json({ ok: true, reused: false });
}
