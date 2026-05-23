import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      mobileNumber: string;
      avatarPath: string | null;
      avatarUrl: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    mobileNumber: string;
    avatarPath: string | null;
    avatarUrl: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    mobileNumber: string;
    avatarPath: string | null;
    avatarUrl: string | null;
  }
}
