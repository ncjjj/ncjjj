"use client";

import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";


export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#f5e6c8]/40">

      {/* SIDEBAR (ALWAYS VISIBLE) */}
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col">

        {/* TOP NAVBAR */}
        <TopNavbar />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
         
        </main>

      </div>
    </div>
  );
}