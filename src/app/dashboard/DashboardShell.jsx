"use client";

import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

export default function DashboardShell({ children }) {
  return (
    <div className="flex h-screen bg-[#f5e6c8]/40">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
