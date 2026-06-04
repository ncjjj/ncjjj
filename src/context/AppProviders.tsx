"use client";

import ReduxProvider from "../components/providers/ReduxProvider";
import AuthSessionProvider from "../components/providers/AuthSessionProvider";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import ToastContainer from "../components/common/ToastContainer";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * Root provider tree:
 *  ReduxProvider     – Redux store available everywhere
 *  └─ AuthSessionProvider – next-auth session
 *       └─ AuthProvider    – rehydrates legacy localStorage auth → Redux
 *            └─ ThemeProvider – rehydrates theme preference → Redux
 *                 └─ children
 */
export default function AppProviders({ children }: Props) {
  return (
    <ReduxProvider>
      <AuthSessionProvider>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <ToastContainer />
          </ThemeProvider>
        </AuthProvider>
      </AuthSessionProvider>
    </ReduxProvider>
  );
}
