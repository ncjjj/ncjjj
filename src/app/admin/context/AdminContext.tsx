"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type AdminState = {
  userCount: number;
  activeTickets: number;
  siteSettings: Record<string, string | number | boolean | null>;
};

type AdminContextValue = {
  adminData: AdminState;
  updateAdminData: <K extends keyof AdminState>(key: K, value: AdminState[K]) => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

type AdminProviderProps = {
  children: ReactNode;
};

export function AdminProvider({ children }: AdminProviderProps) {
  const [adminData, setAdminData] = useState<AdminState>({
    userCount: 0,
    activeTickets: 0,
    siteSettings: {},
  });

  const updateAdminData = <K extends keyof AdminState>(key: K, value: AdminState[K]) => {
    setAdminData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminContext.Provider value={{ adminData, updateAdminData }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider");
  }

  return context;
}