"use client";

import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import type { ReactNode } from "react";
import { useUserSocketRoom } from "../../hooks/useUserSocketRoom";

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  useUserSocketRoom();

  return (
    <div className="dashboard-shell flex h-screen bg-[#f5e6c8]/40">
      <Sidebar />

      <div className="dashboard-main flex flex-1 flex-col">
        <TopNavbar />

        <main className="dashboard-content flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
