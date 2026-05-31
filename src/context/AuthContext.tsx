"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
}

interface AuthInput {
  email: string;
  password: string;
}

type AuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; message: string };

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (input: AuthInput) => AuthResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "ncj-session-user";
const USERS_KEY = "ncj-users";

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (value === null) {
      return fallback;
    }
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const users = safeParse<StoredUser[]>(localStorage.getItem(USERS_KEY), []);
    const sessionUser = safeParse<SessionUser | null>(localStorage.getItem(SESSION_KEY), null);

    if (!Array.isArray(users)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }

    if (sessionUser) {
      setUser(sessionUser);
    }

    setLoading(false);
  }, []);

  const login = ({ email, password }: AuthInput): AuthResult => {
    const users = safeParse<StoredUser[]>(localStorage.getItem(USERS_KEY), []);
    const normalizedEmail = email.trim().toLowerCase();

    const found = users.find(
      (item) => item.email === normalizedEmail && item.password === password
    );

    if (!found) {
      return { ok: false, message: "Invalid email or password." };
    }

    const sessionUser: SessionUser = {
      id: found.id,
      name: found.name,
      email: found.email,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);

    return { ok: true, user: sessionUser };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
