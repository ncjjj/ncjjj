import type { NextApiRequest, NextApiResponse } from "next";
import { ensureConsultationRequestSocketServer } from "../../lib/consultationRequestSocket";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const socket = res.socket;

  if (!socket) {
    res.status(500).json({ ok: false });
    return;
  }

  const server = (socket as any).server as any & {
    consultationRequestSocketInitialized?: boolean;
  };

  if (!server.consultationRequestSocketInitialized) {
    ensureConsultationRequestSocketServer(server);
    server.consultationRequestSocketInitialized = true;
  }

  res.status(200).json({ ok: true });
}
