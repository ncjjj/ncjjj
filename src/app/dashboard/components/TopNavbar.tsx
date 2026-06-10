"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useProfileImage } from "../../../hooks/useProfileImage";
import HamburgerMenu from "./HamburgerMenu";

export default function TopNavbar() {
  const { data: session } = useSession();
  const displayName = session?.user?.name || "User";
  const { profileImageUrl } = useProfileImage({ userId: session?.user?.id ?? null });

  return (
    <div className="dashboard-topbar-wrap sticky top-0 z-50">
      <div className="dashboard-topbar flex min-w-0 items-center justify-between gap-3 bg-gradient-to-r from-[#f5e6c8]/90 via-[#faf6ed]/90 to-[#fffaf0]/90 px-4 py-3 backdrop-blur-xl border-b border-[#e8dcc0] shadow-md sm:px-6 sm:py-4">
        <div className="dashboard-topbar-title min-w-0 truncate text-base font-semibold text-[#3b2f1c] sm:text-xl">
          Welcome, {displayName}
        </div>

        <div className="dashboard-topbar-actions flex shrink-0 items-center gap-3 sm:gap-5">
          <HamburgerMenu />
          <Link
            href="/dashboard/profile"
            aria-label="Open profile settings"
            className="dashboard-avatar relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white flex items-center justify-center font-semibold ring-1 ring-[#d6b86a]/40 hover:ring-[#b89b5e] transition-shadow"
          >
            <img
              src={profileImageUrl}
              alt={`${displayName} avatar`}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
