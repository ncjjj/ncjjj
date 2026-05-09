"use client";

import { AdminProvider, ThemeProvider } from "./context";
import type { ReactNode } from "react";

type AdminClientProvidersProps = {
  children: ReactNode;
};

export default function AdminClientProviders({ children }: AdminClientProvidersProps) {
  return (
    <AdminProvider>
      <ThemeProvider>
        <div className="admin-layout">
          <div className="admin-shell">{children}</div>
        </div>
      </ThemeProvider>
    </AdminProvider>
  );
}
