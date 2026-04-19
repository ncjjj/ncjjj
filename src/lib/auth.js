import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { findUserByEmail } from "../db/queries/users";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authOptions = {
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
          role: dbUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.mobileNumber = user.mobileNumber;
        token.avatarPath = user.avatarPath;
      }

      if (trigger === "update" && session) {
        if (typeof session.name === "string") {
          token.name = session.name;
        }

        if (typeof session.email === "string") {
          token.email = session.email;
        }

        if (typeof session.mobileNumber === "string") {
          token.mobileNumber = session.mobileNumber;
        }

        if (typeof session.avatarPath === "string" || session.avatarPath === null) {
          token.avatarPath = session.avatarPath;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.mobileNumber = token.mobileNumber;
        session.user.avatarPath = token.avatarPath;
      }

      return session;
    },
  },
};
