"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function Footer() {
  const year = new Date().getFullYear();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [startupOpen, setStartupOpen] = useState(false);
  const [complianceOpen, setComplianceOpen] = useState(false);

  return (
    <footer className="site-footer home-footer">
      <div className="decor-line" />
      <div className="decor-circle" />

      {/* Main Footer Content */}
      <div className="site-footer-inner" style={{ padding: "40px 5% 30px" }}>
        <div className="site-footer-columns" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "40px", marginBottom: "40px" }}>
          
          {/* Brand Column */}
          <div className="footer-brand" style={{ maxWidth: "320px", textAlign: "left" }}>
            <h3 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "12px", fontFamily: "Georgia, serif" }}>
              <span style={{ background: "linear-gradient(90deg, #d4af37, #f2d16b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NCJ</span>{" "}
              <span style={{ color: "#f5e6c8" }}>Legal LLP</span>
            </h3>
            <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#9a8d7a", marginBottom: "16px" }}>
              Your trusted partner for all legal, tax, and business compliance needs. We bring decades of expertise to help you succeed.
            </p>
            
            {/* Contact Info (minimized, left-aligned) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#9a8d7a" }}>
              <a 
                href="tel:+919999562401" 
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#9a8d7a", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f2d16b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9a8d7a'}
              >
                <span>📞</span> +91 9999562401
              </a>
              <a 
                href="mailto:info@ncjlegal.com" 
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#9a8d7a", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f2d16b'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9a8d7a'}
              >
                <span>✉️</span> info@ncjlegal.com
              </a>
              <div style={{ display: "inline-flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ marginTop: "2px" }}>📍</span>
                <span>Mainpuri, UP - 205001</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div className="footer-services-menu">
            <button
              type="button"
              className="footer-services-trigger"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((prev) => !prev)}
            >
              <span>Services</span>
              <span className={`footer-services-chevron ${servicesOpen ? "open" : ""}`} aria-hidden="true">›</span>
            </button>

            <div className={`footer-services-panel ${servicesOpen ? "open" : ""}`}>
              {services.map((service) => {
                const isStartup = service.name === "Startup";
                const isCompliance = service.name === "Compliance";

                return (
                  <div key={service.name} className="footer-service-group">
                    <div className="footer-service-row">
                      <Link
                        href={service.href}
                        className="footer-service-link"
                        onClick={() => setServicesOpen(false)}
                      >
                        {service.name}
                      </Link>

                      {isStartup || isCompliance ? (
                        <button
                          type="button"
                          className="footer-service-toggle"
                          aria-expanded={isStartup ? startupOpen : complianceOpen}
                          onClick={() => {
                            if (isStartup) {
                              setStartupOpen((prev) => !prev);
                              setComplianceOpen(false);
                            }

                            if (isCompliance) {
                              setComplianceOpen((prev) => !prev);
                              setStartupOpen(false);
                            }
                          }}
                        >
                          {isStartup ? (startupOpen ? "Hide" : "Show") : complianceOpen ? "Hide" : "Show"}
                        </button>
                      ) : null}
                    </div>

                    {isStartup ? (
                      <div className={`footer-service-submenu ${startupOpen ? "open" : ""}`}>
                        {startupSubmenuItems.map((item) => (
                          <Link key={item.name} href={item.href} className="footer-submenu-link" onClick={() => setServicesOpen(false)}>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}

                    {isCompliance ? (
                      <div className={`footer-service-submenu ${complianceOpen ? "open" : ""}`}>
                        {complianceSubmenuItems.map((item) => (
                          <Link key={item.name} href={item.href} className="footer-submenu-link" onClick={() => setServicesOpen(false)}>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="site-footer-divider" style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
          marginBottom: "30px",
        }}></div>

        {/* Bottom Bar */}
        <div className="site-footer-bottom" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "30px",
        }}>
          <p style={{
            fontSize: "14px",
            color: "#6a5f4f",
            margin: 0,
          }}>
            © {year} <span style={{ color: "#d4af37" }}>NCJ Legal LLP</span>. All rights reserved.
          </p>

          <div style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            flexWrap: "wrap",
            fontSize: "13px",
          }}>
            <Link href="/privacy" style={{
              color: "#9a8d7a",
              textDecoration: "none",
              transition: "color 0.3s",
            }}>
              Privacy Policy
            </Link>
            <span style={{ color: "#d4af37" }}>|</span>
            <Link href="/terms" style={{
              color: "#9a8d7a",
              textDecoration: "none",
              transition: "color 0.3s",
            }}>
              Terms & Conditions
            </Link>
          </div>

          <p style={{
            fontSize: "13px",
            color: "#6a5f4f",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            Made with <span style={{ color: "#d4af37" }}>♥</span> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
