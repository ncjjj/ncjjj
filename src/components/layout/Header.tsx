"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useProfileImage } from "../../hooks/useProfileImage";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const services = [
  { name: "Tax Filing", href: "/services" },
  { name: "Legal Services", href: "/services" },
  { name: "NGO Services", href: "/services" },
  { name: "Accounting", href: "/services" },
  { name: "FSSAI", href: "/services" },
  { name: "Business Setup", href: "/services" },
];

const servicesMenuKeyboardHint =
  "Use Arrow keys to navigate services. Press Home or End to jump, and Escape to close the menu.";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [servicesTriggerHovered, setServicesTriggerHovered] = useState(false);
  const menuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuToggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const servicesTriggerRef = useRef<HTMLButtonElement | null>(null);
  const servicesMenuRef = useRef<HTMLDivElement | null>(null);
  const siteMenuItemCount = navItems.length + (user ? 3 : 2);
  const siteMenuId = "site-mobile-menu-panel";
  const servicesMenuId = "site-services-menu";
  const servicesHintId = "site-services-menu-hint";
  const servicesMenuColumnCount = 2;
  const { profileImageUrl } = useProfileImage({ userId: user?.id ?? null });

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
  const currentPath = pathname ?? "";
  const isServicesRoute = currentPath === "/services" || currentPath.startsWith("/services/");

  const getNavPillStyle = (isHighlighted: boolean) => ({
    padding: "10px 30px",
    borderRadius: "999px",
    textDecoration: "none",
    color: isHighlighted ? "#d4af37" : "#aaa",
    background: isHighlighted ? "#1a1a1a" : "transparent",
    boxShadow: isHighlighted
      ? "inset 0 2px 4px rgba(255,255,255,0.4), 0 4px 8px rgba(0,0,0,0.6)"
      : "none",
    transition: "all 0.3s ease",
  });

  const focusFirstServiceLink = () => {
    const firstLink = servicesMenuRef.current?.querySelector<HTMLAnchorElement>("a[href]");
    firstLink?.focus();
  };

  const getServiceMenuItems = () => {
    if (!servicesMenuRef.current) {
      return [] as HTMLAnchorElement[];
    }

    return Array.from(servicesMenuRef.current.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]'));
  };

  const focusServiceMenuItemByIndex = (index: number) => {
    const items = getServiceMenuItems();

    if (items.length === 0) {
      return;
    }

    const safeIndex = (index + items.length) % items.length;
    items[safeIndex]?.focus();
  };

  const getServiceMenuItemIndex = (currentItem: HTMLAnchorElement) => {
    const items = getServiceMenuItems();

    if (items.length === 0) {
      return -1;
    }

    return items.findIndex((item) => item === currentItem);
  };

  const openServicesMenu = () => {
    setServicesMenuOpen(true);
  };

  const closeServicesMenu = () => {
    setServicesMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMenuClosing(false);
    setServicesMenuOpen(false);
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
    <header
      className="site-header"
      style={{
        width: "100%",
        padding: scrolled ? "16px 40px" : "24px 40px",
        background: "linear-gradient(135deg, #49330c 50%, #1a160e 100%)",
        backdropFilter: "blur(12px)",
        borderBottom: "3px solid rgba(6, 6, 6, 0.2)",
        position: "fixed",
        top: 0,
        left: 0,
        transition: "all 0.3s ease",
        zIndex: 1000000,
      }}
    >
      <div
        className="site-header-inner"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div className="site-header-primary" style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
          {/* LOGO */}
          <Link
            href="/"
            className="site-brand-link"
            style={{
              fontWeight: 600,
              fontSize: "30px",
              textDecoration: "none",
              background: "linear-gradient(90deg, #d4af37, #f5e6a5)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            NCJ LEGAL LLP
          </Link>

          {/* NAV */}
          <nav
            className="site-nav"
            style={{
              position: "relative",
              display: "flex",
              gap: "8px",
              background: "#0d0d0d",
              padding: "6px",
              borderRadius: "999px",
              boxShadow: "inset 0 0 10px rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,175,55,0.2)",
            }}
          >
          {/* NORMAL LINKS */}
          {navItems.map((item) => {
            const isActive = currentPath === item.href;
            const isHighlighted = isActive || hoveredNavItem === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredNavItem(item.href)}
                onMouseLeave={() => setHoveredNavItem((current) => (current === item.href ? null : current))}
                onFocus={() => setHoveredNavItem(item.href)}
                onBlur={() => setHoveredNavItem((current) => (current === item.href ? null : current))}
                style={getNavPillStyle(isHighlighted)}
              >
                {item.label}
              </Link>
            );
          })}
              

          {/* 🔥 SERVICES DROPDOWN */}
          <div
            className="site-services-dropdown"
            style={{ position: "relative", insetBlockStart: 0, display: "flex", alignItems: "center" }}
            onMouseEnter={openServicesMenu}
            onMouseLeave={closeServicesMenu}
            onFocus={openServicesMenu}
            onBlur={(event) => {
              const nextFocused = event.relatedTarget as Node | null;

              if (nextFocused && event.currentTarget.contains(nextFocused)) {
                return;
              }

              closeServicesMenu();
            }}
          >
        <span
              id={servicesHintId}
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: 0,
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              {servicesMenuKeyboardHint}
            </span>
        <button
              ref={servicesTriggerRef}
              type="button"
              aria-expanded={servicesMenuOpen}
              aria-haspopup="menu"
              aria-controls={servicesMenuId}
              aria-describedby={servicesHintId}
              onMouseEnter={() => setServicesTriggerHovered(true)}
              onMouseLeave={() => setServicesTriggerHovered(false)}
              onFocus={() => setServicesTriggerHovered(true)}
              onBlur={() => setServicesTriggerHovered(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  closeServicesMenu();
                  servicesTriggerRef.current?.focus();
                  return;
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  openServicesMenu();
                  requestAnimationFrame(() => {
                    focusFirstServiceLink();
                  });
                  return;
                }

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setServicesMenuOpen((prev) => !prev);
                }
              }}
              style={{
                ...getNavPillStyle(isServicesRoute || servicesMenuOpen || servicesTriggerHovered),
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                lineHeight: 1,
                border: "none",
              }}
            >
              <span>Services</span>
              <span
                className="services-trigger-chevron"
                aria-hidden="true"
                style={{
                  display: "inline-flex",
                  width: "10px",
                  height: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: servicesMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                  flexShrink: 0,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2 4.5L6 8.5L10 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <div
              ref={servicesMenuRef}
              id={servicesMenuId}
              className="dropdown"
              role="menu"
              aria-label="Services menu"
              aria-describedby={servicesHintId}
              aria-hidden={!servicesMenuOpen}
              style={{
                position: "absolute",
                top: "50px",
                left: "60%",
                transform: servicesMenuOpen ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(10px)",
                opacity: servicesMenuOpen ? 1 : 0,
                pointerEvents: servicesMenuOpen ? "auto" : "none",
                transition: "all 0.3s ease",
                width: "480px",
                padding: "20px",
                borderRadius: "18px",
                background: "rgba(10,10,10,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
                zIndex: 999,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {services.map((service, i) => (
                  <Link
                    key={i}
                    href={service.href}
                    role="menuitem"
                    tabIndex={servicesMenuOpen ? 0 : -1}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      textDecoration: "none",
                      color: "#ddd",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid transparent",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(212,175,55,0.12)";
                      e.currentTarget.style.border =
                        "1px solid rgba(212,175,55,0.3)";
                      e.currentTarget.style.color = "#d4af37";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                      e.currentTarget.style.border =
                        "1px solid transparent";
                      e.currentTarget.style.color = "#ddd";
                    }}
                    onClick={closeServicesMenu}
                    onKeyDown={(event) => {
                      const currentIndex = getServiceMenuItemIndex(event.currentTarget);

                      if (currentIndex === -1) {
                        return;
                      }

                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        focusServiceMenuItemByIndex(currentIndex + servicesMenuColumnCount);
                        return;
                      }

                      if (event.key === "ArrowUp") {
                        event.preventDefault();
                        focusServiceMenuItemByIndex(currentIndex - servicesMenuColumnCount);
                        return;
                      }

                      if (event.key === "ArrowRight") {
                        event.preventDefault();

                        if (currentIndex % servicesMenuColumnCount === servicesMenuColumnCount - 1) {
                          return;
                        }

                        focusServiceMenuItemByIndex(currentIndex + 1);
                        return;
                      }

                      if (event.key === "ArrowLeft") {
                        event.preventDefault();

                        if (currentIndex % servicesMenuColumnCount === 0) {
                          return;
                        }

                        focusServiceMenuItemByIndex(currentIndex - 1);
                        return;
                      }

                      if (event.key === "Home") {
                        event.preventDefault();
                        focusServiceMenuItemByIndex(0);
                        return;
                      }

                      if (event.key === "End") {
                        event.preventDefault();
                        focusServiceMenuItemByIndex(-1);
                        return;
                      }

                      if (event.key === "Escape") {
                        event.preventDefault();
                        closeServicesMenu();
                        servicesTriggerRef.current?.focus();
                      }
                    }}
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          </nav>
        </div>

        <button
          ref={menuToggleButtonRef}
          type="button"
          className="site-header-mobile-toggle"
          aria-controls={siteMenuId}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => {
            if (menuOpen) {
              closeMenu();
              return;
            }

            openMenu();
          }}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            border: "1px solid rgba(212,175,55,0.35)",
            background: "rgba(10,10,10,0.55)",
            color: "#f5e6a5",
            fontSize: "22px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span className={`hamburger-icon ${menuOpen ? "is-open" : ""}`} aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className="site-auth" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className="site-auth-link"
                style={{
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(212,175,55,0.35)",
                  background: "rgba(212,175,55,0.15)",
                  color: "#f5e6a5",
                  textDecoration: "none",
                }}
              >
                Dashboard
              </Link>
              <span style={{ color: "#d4af37", fontSize: "13px" }}>
                Hi, {user.name}
              </span>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "999px",
                  overflow: "hidden",
                  border: "1px solid rgba(212,175,55,0.45)",
                  background: "rgba(212,175,55,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={profileImageUrl}
                  alt={user.name || "User avatar"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="site-auth-button"
                style={{
                  padding: "10px 16px",
                  borderRadius: "999px",
                  border: "1px solid rgba(212,175,55,0.35)",
                  background: "transparent",
                  color: "#d4af37",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="site-auth-link"
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                border: "1px solid #d4af37",
                color: "#d4af37",
                textDecoration: "none",
              }}
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>

      {showMenuLayer ? (
        <div
          className={`site-mobile-menu-backdrop ${menuClosing ? "is-closing" : ""}`}
          onClick={closeMenu}
          aria-hidden="true"
        ></div>
      ) : null}

      {showMenuLayer ? (
        <div
          id={siteMenuId}
          ref={menuPanelRef}
          className={`site-mobile-menu ${menuClosing ? "is-closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          tabIndex={-1}
          style={{
            ["--stagger-count" as string]: siteMenuItemCount,
            marginTop: "14px",
            padding: "16px",
            borderRadius: "20px",
            background: "rgba(10,10,10,0.95)",
            border: "1px solid rgba(212,175,55,0.18)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            position: "relative",
            zIndex: 3,
          }}
        >
          <div className="mobile-menu-list" style={{ display: "grid", gap: "10px" }}>
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="mobile-menu-item"
                  style={{
                    ["--stagger-order" as string]: index + 1,
                    animationDelay: `${index * 45}ms`,
                    padding: "12px 14px",
                    borderRadius: "14px",
                    textDecoration: "none",
                    color: isActive ? "#d4af37" : "#ddd",
                    background: isActive ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,175,55,0.12)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/services"
              onClick={closeMenu}
              className="mobile-menu-item"
              style={{
                ["--stagger-order" as string]: navItems.length + 1,
                animationDelay: `${navItems.length * 45}ms`,
                padding: "12px 14px",
                borderRadius: "14px",
                textDecoration: "none",
                color: "#ddd",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.12)",
              }}
            >
              Services
            </Link>

            {user ? (
              <>
                <Link
                  href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                  onClick={closeMenu}
                  className="mobile-menu-item"
                  style={{
                    ["--stagger-order" as string]: navItems.length + 2,
                    animationDelay: `${(navItems.length + 1) * 45}ms`,
                    padding: "12px 14px",
                    borderRadius: "14px",
                    textDecoration: "none",
                    color: "#f5e6a5",
                    background: "rgba(212,175,55,0.12)",
                    border: "1px solid rgba(212,175,55,0.22)",
                  }}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="mobile-menu-item"
                  style={{
                    ["--stagger-order" as string]: navItems.length + 3,
                    animationDelay: `${(navItems.length + 2) * 45}ms`,
                    padding: "12px 14px",
                    borderRadius: "14px",
                    textAlign: "left",
                    border: "1px solid rgba(212,175,55,0.22)",
                    background: "transparent",
                    color: "#d4af37",
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="mobile-menu-item"
                style={{
                  ["--stagger-order" as string]: navItems.length + 2,
                  animationDelay: `${(navItems.length + 1) * 45}ms`,
                  padding: "12px 14px",
                  borderRadius: "14px",
                  textDecoration: "none",
                  color: "#d4af37",
                  background: "rgba(212,175,55,0.12)",
                  border: "1px solid rgba(212,175,55,0.22)",
                }}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}