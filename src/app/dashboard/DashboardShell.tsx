"use client";

import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type DashboardShellProps = {
  children: ReactNode;
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isProfileRoute =
    pathname === "/dashboard/profile" || pathname?.startsWith("/dashboard/profile/");

  return (
    <div
      className={`dashboard-shell flex h-screen bg-[#f5e6c8]/40${isProfileRoute ? " dashboard-shell--profile" : ""}`}
    >
      <Sidebar />

      <div className="dashboard-main flex flex-1 flex-col">
        <TopNavbar />

        <main className="dashboard-content flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
