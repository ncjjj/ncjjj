"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useProfileImage } from "../../../hooks/useProfileImage";

const navItems = [
  { name: 'Dashboard Overview', path: '/dashboard' },
  { name: 'My Requests', path: '/dashboard/consultations' },
  { name: 'Documents', path: '/dashboard/documents' },
  { name: 'Profile Settings', path: '/dashboard/profile' },
];

export default function TopNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const displayName = session?.user?.name || "User";
  const { profileImageUrl } = useProfileImage({ userId: session?.user?.id ?? null });
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuItemCount = navItems.length + 1;
  const dashboardMenuId = "dashboard-mobile-menu-panel";

  const getFocusableElements = (container: HTMLElement | null): HTMLElement[] => {
    if (!container) {
      return [];
    }

    const selector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    return Array.from(container.querySelectorAll<HTMLElement>(selector));
  };

  const clearMenuCloseTimer = () => {
    if (menuCloseTimerRef.current) {
      clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
  };

  const openMenu = () => {
    clearMenuCloseTimer();
    setMenuClosing(false);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (!menuOpen) {
      return;
    }

    const closeDelay = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 320;

    setMenuClosing(true);
    setMenuOpen(false);
    clearMenuCloseTimer();
    menuToggleButtonRef.current?.focus();

    if (closeDelay === 0) {
      setMenuClosing(false);
      return;
    }

    menuCloseTimerRef.current = setTimeout(() => {
      setMenuClosing(false);
      menuCloseTimerRef.current = null;
    }, closeDelay);
  };

  const showMenuLayer = menuOpen || menuClosing;

  useEffect(() => {
    setMenuOpen(false);
    setMenuClosing(false);
    clearMenuCloseTimer();
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearMenuCloseTimer();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const panel = menuPanelRef.current;
    const focusableElements = getFocusableElements(panel);

    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    } else {
      panel?.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const currentFocusable = getFocusableElements(menuPanelRef.current);

      if (currentFocusable.length === 0) {
        event.preventDefault();
        menuPanelRef.current?.focus();
        return;
      }

      const firstElement = currentFocusable[0];
      const lastElement = currentFocusable[currentFocusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="dashboard-topbar-wrap sticky top-0 z-50">
      <div className="dashboard-topbar flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#f5e6c8]/90 via-[#faf6ed]/90 to-[#fffaf0]/90 backdrop-blur-xl border-b border-[#e8dcc0] shadow-md">
        <div className="dashboard-topbar-title text-xl font-semibold text-[#3b2f1c]">Welcome, {displayName}</div>

        <button
          ref={menuToggleButtonRef}
          type="button"
          className="dashboard-topbar-toggle"
          aria-controls={dashboardMenuId}
          aria-haspopup="dialog"
          aria-label="Toggle dashboard menu"
          aria-expanded={menuOpen}
          onClick={() => {
            if (menuOpen) {
              closeMenu();
              return;
            }

            openMenu();
          }}
        >
          <span className={`dashboard-hamburger-icon ${menuOpen ? "is-open" : ""}`} aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className="dashboard-topbar-actions flex items-center gap-5">
        <div className="dashboard-avatar w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white flex items-center justify-center font-semibold">
          <img
            src={profileImageUrl}
            alt={`${displayName} avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        </div>
      </div>

      {showMenuLayer ? (
        <div
          className={`dashboard-mobile-menu-backdrop ${menuClosing ? "is-closing" : ""}`}
          onClick={closeMenu}
          aria-hidden="true"
        ></div>
      ) : null}

      {showMenuLayer ? (
        <div
          id={dashboardMenuId}
          ref={menuPanelRef}
          className={`dashboard-mobile-menu bg-white/95 backdrop-blur-xl border-b border-[#e8dcc0] shadow-lg px-4 py-4 ${menuClosing ? "is-closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard mobile navigation menu"
          tabIndex={-1}
          style={{ ["--stagger-count" as string]: mobileMenuItemCount }}
        >
          <div className="space-y-4">
            <div className="text-sm font-medium text-[#6b5b3e]">
              Quick Actions
            </div>

            <div className="grid grid-cols-1 gap-2">
              {navItems.map((item, index) => {
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={closeMenu}
                    className={`dashboard-mobile-item dashboard-mobile-link rounded-xl border px-4 py-3 text-sm transition ${
                      isActive
                        ? "border-[#d6b86a] bg-[#faf6ed] text-[#3b2f1c]"
                        : "border-[#e5d7b6] bg-white text-[#6b5b3e]"
                    }`}
                    style={{
                      ["--stagger-order" as string]: index + 1,
                      animationDelay: `${index * 45}ms`,
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  signOut({ callbackUrl: "/login" });
                }}
                className="dashboard-mobile-item rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700 transition hover:bg-red-100"
                style={{
                  ["--stagger-order" as string]: navItems.length + 1,
                  animationDelay: `${navItems.length * 45}ms`,
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
