"use client";

import Image from "next/image";

export default function TopNavbar() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f5e6c8]/90 via-[#faf6ed]/90 to-[#fffaf0]/90 backdrop-blur-xl border-b border-[#e8dcc0] shadow-md">
      {/* LEFT */}
      <div className="text-xl font-semibold text-[#3b2f1c]">Good Morning, Ayush 👋</div>
      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {/* 🔍 SEARCH */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-4 pr-4 py-2 rounded-xl bg-white/70 border border-[#e5d7b6] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d6b86a] focus:shadow-md transition-all duration-300"
          />
        </div>
        {/* NOTIFICATIONS */}
        <div className="w-8 h-8 bg-[#f5e6c8] rounded-full flex items-center justify-center shadow-md">🔔</div>
        {/* PROFILE */}
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src="/path-to-avatar.jpg"
            alt="User Avatar"
            width={40}
            height={40}
          />
        </div>
      </div>
    </div>
  );
}