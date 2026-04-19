"use client";

import { useSession } from "next-auth/react";

export default function TopNavbar() {
  const { data: session } = useSession();
  const displayName = session?.user?.name || "User";

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f5e6c8]/90 via-[#faf6ed]/90 to-[#fffaf0]/90 backdrop-blur-xl border-b border-[#e8dcc0] shadow-md">
      <div className="text-xl font-semibold text-[#3b2f1c]">Welcome, {displayName}</div>
      <div className="flex items-center gap-5">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search dashboard..."
            className="w-64 pl-4 pr-4 py-2 rounded-xl bg-white/70 border border-[#e5d7b6] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d6b86a] focus:shadow-md transition-all duration-300"
          />
        </div>
        <div className="w-8 h-8 bg-[#f5e6c8] rounded-full flex items-center justify-center shadow-md">🔔</div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white flex items-center justify-center font-semibold">
          {displayName?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
}