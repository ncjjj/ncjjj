"use client";

import { createContext, useContext, useState } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminData, setAdminData] = useState({
    userCount: 0,
    activeTickets: 0,
    siteSettings: {},
  });

  const updateAdminData = (key, value) => {
    setAdminData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminContext.Provider value={{ adminData, updateAdminData }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  return useContext(AdminContext);
}