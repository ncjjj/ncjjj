import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { findUserByEmail } from "../db/queries/users";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const normalizedEmail = parsed.data.email.trim().toLowerCase();
        const dbUser = await findUserByEmail(normalizedEmail);

        if (!dbUser) {
          return null;
        }

        const passwordValid = await bcrypt.compare(parsed.data.password, dbUser.password);

        if (!passwordValid) {
          return null;
        }

        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          mobileNumber: dbUser.mobileNumber,
          avatarPath: dbUser.avatarPath,
          avatarUrl: dbUser.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
        token.mobileNumber = user.mobileNumber;
        token.avatarPath = user.avatarPath;
        token.avatarUrl = user.avatarUrl;
      }

      if (trigger === "update" && session) {
        if (session.user && typeof session.user.name === "string") {
          token.name = session.user.name;
        }

        if (session.user && typeof session.user.email === "string") {
          token.email = session.user.email;
        }

        if (session.user && typeof session.user.mobileNumber === "string") {
          token.mobileNumber = session.user.mobileNumber;
        }

        if (
          session.user &&
          (typeof session.user.avatarPath === "string" || session.user.avatarPath === null)
        ) {
          token.avatarPath = session.user.avatarPath;
        }

        if (
          session.user &&
          (typeof session.user.avatarUrl === "string" || session.user.avatarUrl === null)
        ) {
          token.avatarUrl = session.user.avatarUrl;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.name = typeof token.name === "string" ? token.name : null;
        session.user.email = typeof token.email === "string" ? token.email : null;
        session.user.mobileNumber =
          typeof token.mobileNumber === "string" ? token.mobileNumber : "";
        session.user.avatarPath =
          typeof token.avatarPath === "string" || token.avatarPath === null
            ? token.avatarPath
            : null;
        session.user.avatarUrl =
          typeof token.avatarUrl === "string" || token.avatarUrl === null
            ? token.avatarUrl
            : null;
      }

      return session;
    },
  },
};
