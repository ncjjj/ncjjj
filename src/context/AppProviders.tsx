"use client";

import AuthSessionProvider from "../components/providers/AuthSessionProvider";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AppProviders({ children }: Props) {
  return (
    <AuthSessionProvider>
      <AuthProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </AuthProvider>
    </AuthSessionProvider>
  );
}
