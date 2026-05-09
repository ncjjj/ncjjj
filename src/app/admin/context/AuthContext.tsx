"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AuthUser = Record<string, unknown>;

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
};

type AuthContextValue = {
  authState: AuthState;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const login = (user: AuthUser) => {
    setAuthState({ isAuthenticated: true, user });
  };

  const logout = () => {
    setAuthState({ isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}