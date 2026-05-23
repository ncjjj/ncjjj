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
  { name: "Startup", href: "/services/business-setup" },
  { name: "Compliance", href: "/services/gst-consultation" },
  { name: "Legal Services", href: "/services/legal-assistance" },
];

const startupSubmenuItems = [
  { name: "NGO", href: "/services/ngo" },
  { name: "Business Registration", href: "/services/business-setup" },
  { name: "Government Registration", href: "/services/registration" },
  { name: "Government Licenses", href: "/services/licenses" },
  { name: "FSSAI and Eating Licenses", href: "/services/fssai" },
  { name: "ISO Certifications", href: "/services/iso-certifications" },
];

const complianceSubmenuItems = [
  { name: "Tax Filing", href: "/services/gst-consultation" },
  { name: "Accounting and CFO", href: "/services/accounting-support" },
  { name: "Contracts and agreements", href: "/services/contracts-agreements" },
];

const servicesMenuKeyboardHint =
  "Use Arrow keys to navigate services. Press Home or End to jump, and Escape to close the menu.";

export default function Header() {
  const logoSrc =  "/images/ncj.jpeg";
  const logoHeight = 60;
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const [servicesTriggerHovered, setServicesTriggerHovered] = useState(false);
  const [startupSubmenuOpen, setStartupSubmenuOpen] = useState(false);
  const [complianceSubmenuOpen, setComplianceSubmenuOpen] = useState(false);
  const servicesCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startupSubmenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const complianceSubmenuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesTriggerRef = useRef<HTMLButtonElement | null>(null);
  const servicesMenuRef = useRef<HTMLDivElement | null>(null);
  const startupSubmenuRef = useRef<HTMLDivElement | null>(null);
  const complianceSubmenuRef = useRef<HTMLDivElement | null>(null);
  const servicesMenuId = "site-services-menu";
  const servicesHintId = "site-services-menu-hint";
  const servicesMenuColumnCount = 1;
  const startupSubmenuId = "site-startup-submenu";
  const complianceSubmenuId = "site-compliance-submenu";
  const { profileImageUrl } = useProfileImage({ userId: user?.id ?? null });
  const profileSettingsHref = "/dashboard/profile";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileStartupOpen, setMobileStartupOpen] = useState(false);
  const [mobileComplianceOpen, setMobileComplianceOpen] = useState(false);
  

  const clearServicesCloseTimer = () => {
    if (servicesCloseTimerRef.current) {
      clearTimeout(servicesCloseTimerRef.current);
      servicesCloseTimerRef.current = null;
    }
  };

  const clearStartupSubmenuCloseTimer = () => {
    if (startupSubmenuCloseTimerRef.current) {
      clearTimeout(startupSubmenuCloseTimerRef.current);
      startupSubmenuCloseTimerRef.current = null;
    }
  };

  const clearComplianceSubmenuCloseTimer = () => {
    if (complianceSubmenuCloseTimerRef.current) {
      clearTimeout(complianceSubmenuCloseTimerRef.current);
      complianceSubmenuCloseTimerRef.current = null;
    }
  };

  const currentPath = pathname ?? "";
  const isServicesRoute = currentPath === "/services" || currentPath.startsWith("/services/");

  // CSS classes handle pill styling; toggle `nav-pill--active` when highlighted.

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
    clearServicesCloseTimer();
    setServicesMenuOpen(true);
  };

  const closeServicesMenu = () => {
    clearServicesCloseTimer();
    setServicesMenuOpen(false);
  };

  const scheduleCloseServicesMenu = () => {
    clearServicesCloseTimer();

    servicesCloseTimerRef.current = setTimeout(() => {
      setServicesMenuOpen(false);
      servicesCloseTimerRef.current = null;
    }, 160);
  };

  const openStartupSubmenu = () => {
    clearStartupSubmenuCloseTimer();
    setStartupSubmenuOpen(true);
  };

  const closeStartupSubmenu = () => {
    clearStartupSubmenuCloseTimer();
    setStartupSubmenuOpen(false);
  };

  const scheduleCloseStartupSubmenu = () => {
    clearStartupSubmenuCloseTimer();

    startupSubmenuCloseTimerRef.current = setTimeout(() => {
      setStartupSubmenuOpen(false);
      startupSubmenuCloseTimerRef.current = null;
    }, 160);
  };

  const openComplianceSubmenu = () => {
    clearComplianceSubmenuCloseTimer();
    setComplianceSubmenuOpen(true);
  };

  const closeComplianceSubmenu = () => {
    clearComplianceSubmenuCloseTimer();
    setComplianceSubmenuOpen(false);
  };

  const scheduleCloseComplianceSubmenu = () => {
    clearComplianceSubmenuCloseTimer();

    complianceSubmenuCloseTimerRef.current = setTimeout(() => {
      setComplianceSubmenuOpen(false);
      complianceSubmenuCloseTimerRef.current = null;
    }, 160);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setServicesMenuOpen(false);
    setStartupSubmenuOpen(false);
    setComplianceSubmenuOpen(false);
    clearStartupSubmenuCloseTimer();
    clearComplianceSubmenuCloseTimer();
  }, [pathname]);

  useEffect(() => {
    return () => {
      clearServicesCloseTimer();
      clearStartupSubmenuCloseTimer();
      clearComplianceSubmenuCloseTimer();
    };
  }, []);

  return (
    <header
      className="site-header"
      style={{
        width: "100%",
        padding:  "14px 24px",
        background: "#FFFFFF",
        backdropFilter: "none",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
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
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div className="site-header-primary" style={{ display: "flex", alignItems: "center", gap: "30px", flex: 1, minWidth: 0 }}>
          {/* LOGO */}
          <Link
            href="/"
            className="site-brand-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "16px",
              textDecoration: "none",
            }}
          >
            <img src={logoSrc} alt="NCJ Legal LLP" style={{ height: logoHeight, width: "auto" }} />
          </Link>

          {/* NAV */}
          <nav
            className="site-nav"
            style={{
              position: "relative",
              display: "flex",
              gap: "6px",
              background: "transparent",
              padding: "4px",
              borderRadius: "999px",
              boxShadow: "inset 0 0 6px rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
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
                className={`nav-pill ${isHighlighted ? "nav-pill--active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}

          <div
            className="site-services-dropdown"
            style={{ position: "relative", insetBlockStart: 0, display: "flex", alignItems: "center" }}
            onMouseEnter={openServicesMenu}
            onMouseLeave={scheduleCloseServicesMenu}
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
              className={`services-trigger ${servicesMenuOpen ? 'open' : ''}`}
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
              className={`dropdown ${servicesMenuOpen ? 'open' : ''}`}
              role="menu"
              aria-label="Services menu"
              aria-describedby={servicesHintId}
              aria-hidden={!servicesMenuOpen}
              onMouseEnter={openServicesMenu}
              onMouseLeave={scheduleCloseServicesMenu}
            >
              <div
                className="dropdown-grid"
              >
                {services.map((service, i) => (
                  service.name === "Startup" ? (
                    <div key={service.name} style={{ position: "relative" }} onMouseEnter={openStartupSubmenu} onMouseLeave={scheduleCloseStartupSubmenu}>
                      <Link href={service.href} role="menuitem" tabIndex={servicesMenuOpen ? 0 : -1} aria-haspopup="menu" aria-expanded={startupSubmenuOpen} aria-controls={startupSubmenuId} className="dropdown-link" onClick={(event) => { event.preventDefault(); event.stopPropagation(); }} onKeyDown={(event) => {
                          const currentIndex = getServiceMenuItemIndex(event.currentTarget);

                          if (currentIndex === -1) {
                            return;
                          }

                          if (event.key === "ArrowDown") {
                            event.preventDefault();
                            openStartupSubmenu();
                            return;
                          }

                          if (event.key === "ArrowUp") {
                            event.preventDefault();
                            focusServiceMenuItemByIndex(currentIndex - servicesMenuColumnCount);
                            return;
                          }

                          if (event.key === "ArrowRight") {
                            event.preventDefault();
                            openStartupSubmenu();
                            return;
                          }

                          if (event.key === "ArrowLeft") {
                            event.preventDefault();
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
                            closeStartupSubmenu();
                            closeServicesMenu();
                            servicesTriggerRef.current?.focus();
                          }
                        }}>
                        <span>{service.name}</span>
                        <span aria-hidden="true" style={{ fontSize: "12px", color: "#b89b5e" }}>›</span>
                      </Link>

                      <div ref={startupSubmenuRef} id={startupSubmenuId} role="menu" aria-label="Startup submenu" aria-hidden={!startupSubmenuOpen} onMouseEnter={openStartupSubmenu} onMouseLeave={scheduleCloseStartupSubmenu} className={`submenu ${startupSubmenuOpen ? 'open' : ''}`}>
                        <div style={{ display: "grid", gap: "10px" }}>
                          {startupSubmenuItems.map((item) => (
                            <Link key={item.name} href={item.href} role="menuitem" tabIndex={startupSubmenuOpen ? 0 : -1} onClick={() => { closeStartupSubmenu(); closeServicesMenu(); }} className="dropdown-link">
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : service.name === "Compliance" ? (
                    <div key={service.name} style={{ position: "relative" }} onMouseEnter={openComplianceSubmenu} onMouseLeave={scheduleCloseComplianceSubmenu}>
                      <Link href={service.href} role="menuitem" tabIndex={servicesMenuOpen ? 0 : -1} aria-haspopup="menu" aria-expanded={complianceSubmenuOpen} aria-controls={complianceSubmenuId} className="dropdown-link" onClick={(event) => { event.preventDefault(); event.stopPropagation(); }} onKeyDown={(event) => {
                          const currentIndex = getServiceMenuItemIndex(event.currentTarget);

                          if (currentIndex === -1) {
                            return;
                          }

                          if (event.key === "ArrowDown") {
                            event.preventDefault();
                            openComplianceSubmenu();
                            return;
                          }

                          if (event.key === "ArrowUp") {
                            event.preventDefault();
                            focusServiceMenuItemByIndex(currentIndex - servicesMenuColumnCount);
                            return;
                          }

                          if (event.key === "ArrowRight") {
                            event.preventDefault();
                            openComplianceSubmenu();
                            return;
                          }

                          if (event.key === "ArrowLeft") {
                            event.preventDefault();
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
                            closeComplianceSubmenu();
                            closeServicesMenu();
                            servicesTriggerRef.current?.focus();
                          }
                        }}>
                        <span>{service.name}</span>
                        <span aria-hidden="true" style={{ fontSize: "12px", color: "#b89b5e" }}>›</span>
                      </Link>

                      <div ref={complianceSubmenuRef} id={complianceSubmenuId} role="menu" aria-label="Compliance submenu" aria-hidden={!complianceSubmenuOpen} onMouseEnter={openComplianceSubmenu} onMouseLeave={scheduleCloseComplianceSubmenu} className={`submenu ${complianceSubmenuOpen ? 'open' : ''}`}>
                        <div style={{ display: "grid", gap: "8px" }}>
                          {complianceSubmenuItems.map((item) => (
                            <Link key={item.name} href={item.href} role="menuitem" tabIndex={complianceSubmenuOpen ? 0 : -1} onClick={() => { closeComplianceSubmenu(); closeServicesMenu(); }} className="dropdown-link">
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link key={service.name} href={service.href} role="menuitem" tabIndex={servicesMenuOpen ? 0 : -1} className="dropdown-link" onClick={closeServicesMenu} onKeyDown={(event) => {
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
                  )
                ))}
              </div>
            </div>
          </div>
          </nav>
        </div>

        <div className="site-auth" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user ? (
            <>
              <div className="site-user-avatar desktop-avatar" style={{
                position: "relative",
                width: "36px",
                height: "36px",
                borderRadius: "999px",
                overflow: "hidden",
                border: "1px solid rgba(212,175,55,0.45)",
                background: "rgba(212,175,55,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}>
                <Link
                  href={profileSettingsHref}
                  aria-label="Open profile settings"
                  onClick={() => setMobileNavOpen(false)}
                  style={{ position: "absolute", inset: 0, zIndex: 2 }}
                />
                <img src={profileImageUrl} alt={user.name || "User avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="site-auth-button site-auth-logout desktop-logout"
                style={{
                  padding: "6px 10px",
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
                padding: "9px 14px",
                borderRadius: "999px",
                border: "1px solid #d4af37",
                color: "#d4af37",
                textDecoration: "none",
              }}
            >
              Login / Sign Up
            </Link>
          )}
          {/* Mobile nav toggle */}
          <button
            aria-label="Toggle navigation"
            className={`mobile-nav-button ${mobileNavOpen ? 'open' : ''}`}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((s) => !s)}
            style={{ marginLeft: 6 }}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>
      </div>
      {/* Mobile stacked nav panel (phones) */}
      <div className={`mobile-nav-panel ${mobileNavOpen ? "open" : ""}`} role="navigation" aria-hidden={!mobileNavOpen}>
        <div className="mobile-nav-header">
          <Link href="/" onClick={() => setMobileNavOpen(false)} className="site-brand-link">
            <img src={logoSrc} alt="NCJ" style={{ height: 40 }} />
          </Link>
          <button aria-label="Close menu" className="mobile-nav-close" onClick={() => setMobileNavOpen(false)}>✕</button>
        </div>

        {user ? (
          <div className="mobile-nav-user">
            <Link
              href={profileSettingsHref}
              aria-label="Open profile settings"
              onClick={() => setMobileNavOpen(false)}
              className="mobile-nav-avatar"
            >
              <img src={profileImageUrl} alt={user.name || "User avatar"} />
            </Link>
            {user.name ? <span className="mobile-nav-user-name">{user.name}</span> : null}
          </div>
        ) : null}

        <div className="mobile-nav-body">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)} className="mobile-nav-link">
              {item.label}
            </Link>
          ))}

          <div className="mobile-section">
            <button className="mobile-section-toggle" onClick={() => setMobileServicesOpen((s) => !s)} aria-expanded={mobileServicesOpen}>
              Services
            </button>

            {mobileServicesOpen && (
              <div className="mobile-section-body">
                {services.map((service) => (
                  service.name === 'Startup' ? (
                    <div key={service.name} className="mobile-subsection">
                      <button className="mobile-subsection-toggle" onClick={() => setMobileStartupOpen((s) => !s)} aria-expanded={mobileStartupOpen}>{service.name}</button>
                      {mobileStartupOpen && (
                        <div className="mobile-subsection-body">
                          {startupSubmenuItems.map((it) => (
                            <Link key={it.name} href={it.href} onClick={() => setMobileNavOpen(false)} className="mobile-nav-sublink">{it.name}</Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : service.name === 'Compliance' ? (
                    <div key={service.name} className="mobile-subsection">
                      <button className="mobile-subsection-toggle" onClick={() => setMobileComplianceOpen((s) => !s)} aria-expanded={mobileComplianceOpen}>{service.name}</button>
                      {mobileComplianceOpen && (
                        <div className="mobile-subsection-body">
                          {complianceSubmenuItems.map((it) => (
                            <Link key={it.name} href={it.href} onClick={() => setMobileNavOpen(false)} className="mobile-nav-sublink">{it.name}</Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link key={service.name} href={service.href} onClick={() => setMobileNavOpen(false)} className="mobile-nav-link">{service.name}</Link>
                  )
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <button onClick={() => { setMobileNavOpen(false); signOut({ callbackUrl: '/' }); }} className="mobile-nav-logout">Logout</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileNavOpen(false)} className="mobile-nav-link">Login / Sign Up</Link>
          )}
        </div>
      </div>
    </header>
  );
}
