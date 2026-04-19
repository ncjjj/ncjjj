"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const [scrolled, setScrolled] = useState(false);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let refreshTimer;

    const loadSignedAvatar = async () => {
      if (!user) {
        setAvatarSignedUrl("");
        return;
      }

      try {
        const response = await fetch("/api/uploads/avatar", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load avatar.");
        }

        setAvatarSignedUrl(payload?.avatarSignedUrl || "");
      } catch (error) {
        setAvatarSignedUrl("");
      }
    };

    loadSignedAvatar();
    refreshTimer = setInterval(loadSignedAvatar, 50 * 60 * 1000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [user?.id]);

  return (
    <header
      style={{
         width: "100%",
        padding: scrolled ? "16px 40px" : "24px 40px",
        background: "linear-gradient(135deg, #49330c 50%, #1a160e 100%))",
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
        {/* LOGO */}
        <Link
          href="/"
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
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "10px 30px",
                  borderRadius: "999px",
                  textDecoration: "none",
                  color: isActive ? "#d4af37" : "#aaa",
                  background: isActive ? "#1a1a1a" : "transparent",
                  boxShadow: isActive
                    ? "inset 0 2px 4px rgba(255,255,255,0.4), 0 4px 8px rgba(0,0,0,0.6)"
                    : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {item.label}
              </Link>
            );
          })}
              

          {/* 🔥 SERVICES DROPDOWN */}
          <div
          className="mt-3"          
            style={{ position: "relative", insetBlockStart: 0 }}
            onMouseEnter={(e) => {
              const dropdown = e.currentTarget.querySelector(".dropdown");
              dropdown.style.opacity = "1";
              dropdown.style.transform =
                "translateX(-50%) translateY(0)";
              dropdown.style.pointerEvents = "auto";
            }}
            onMouseLeave={(e) => {
              const dropdown = e.currentTarget.querySelector(".dropdown");
              dropdown.style.opacity = "0";
              dropdown.style.transform =
                "translateX(-50%) translateY(10px)";
              dropdown.style.pointerEvents = "none";
            }}
          >
        <span
              style={{
                padding: "10px 18px",
                borderRadius: "999px",
                color: "#aaa",
                cursor: "pointer",
              }}
            >
              Services
            </span>

            <div
              className="dropdown"
              style={{
                position: "absolute",
                top: "50px",
                left: "60%",
                transform: "translateX(-50%) translateY(10px)",
                opacity: 0,
                pointerEvents: "none",
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
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* AUTH */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/dashboard"}
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
                {avatarSignedUrl ? (
                  <img
                    src={avatarSignedUrl}
                    alt={user.name || "User avatar"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: "#f5e6a5", fontWeight: 700 }}>
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
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
    </header>
  );
}