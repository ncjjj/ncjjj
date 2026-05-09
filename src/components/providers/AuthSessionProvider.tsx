"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

type AuthSessionProviderProps = {
  children: ReactNode;
  session?: Session | null;
};

export default function AuthSessionProvider({
  children,
  session,
}: AuthSessionProviderProps) {
  if (typeof session === "undefined") {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return <SessionProvider session={session}>{children}</SessionProvider>;
}
