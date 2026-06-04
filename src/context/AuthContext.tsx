"use client";

import { useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setUser, clearUser, setAuthLoading } from "../store/slices/authSlice";
import type { SessionUser } from "../store/slices/authSlice";

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = "ncj-session-user";
const USERS_KEY = "ncj-users";

// ─── Internal types ───────────────────────────────────────────────────────────

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

interface AuthInput {
  email: string;
  password: string;
}

type AuthResult =
  | { ok: true; user: SessionUser }
  | { ok: false; message: string };

// ─── Helper ───────────────────────────────────────────────────────────────────

function safeParse<T>(value: string | null, fallback: T): T {
  try {
    if (value === null) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// ─── Provider (initialiser only — no context) ─────────────────────────────────

/**
 * AuthProvider now dispatches to Redux on mount to rehydrate the user session
 * from localStorage. It no longer exposes a React context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const users = safeParse<StoredUser[]>(localStorage.getItem(USERS_KEY), []);
    const sessionUser = safeParse<SessionUser | null>(
      localStorage.getItem(SESSION_KEY),
      null
    );

    if (!Array.isArray(users)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }

    if (sessionUser) {
      dispatch(setUser(sessionUser));
    }

    dispatch(setAuthLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Drop-in replacement for the old context-based hook.
 * Same return shape — callers need no changes.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.auth.loading);

  const login = useCallback(
    ({ email, password }: AuthInput): AuthResult => {
      const users = safeParse<StoredUser[]>(
        localStorage.getItem(USERS_KEY),
        []
      );
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
      dispatch(setUser(sessionUser));

      return { ok: true, user: sessionUser };
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    dispatch(clearUser());
  }, [dispatch]);

  return { user, loading, login, logout };
}
