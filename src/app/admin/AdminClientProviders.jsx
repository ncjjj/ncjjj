"use client";

import { AdminProvider, ThemeProvider } from "./context";

export default function AdminClientProviders({ children }) {
  return (
    <AdminProvider>
      <ThemeProvider>
        <div className="admin-layout">{children}</div>
      </ThemeProvider>
    </AdminProvider>
  );
}
