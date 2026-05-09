"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { getUserSocketClient } from "../lib/socketClient";

export function useUserSocketRoom() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? "";
  const isAuthenticatedUser = status === "authenticated" && session?.user?.role === "user";

  useEffect(() => {
    if (!isAuthenticatedUser || !userId) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      const socket = await getUserSocketClient();

      if (!socket || disposed) {
        return;
      }

      const joinCurrentUserRoom = () => {
        socket.emit("joinUserRoom", { userId });
      };

      socket.on("connect", joinCurrentUserRoom);

      if (socket.connected) {
        joinCurrentUserRoom();
      }

      cleanup = () => {
        socket.off("connect", joinCurrentUserRoom);
      };
    };

    setup();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [isAuthenticatedUser, userId]);
}
