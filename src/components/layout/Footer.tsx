"use client";

import Link from "next/link";

const startupLinks = [
  { name: "NGO", href: "/services/ngo" },
  { name: "Business Registration", href: "/services/business-startup" },
  { name: "Government Registration", href: "/services/registration" },
  { name: "Government Licenses", href: "/services/licenses" },
  { name: "FSSAI and Eating Licenses", href: "/services/fssai" },
  { name: "ISO Certifications", href: "/services/iso-certifications" },
];

const complianceLinks = [
  { name: "Tax Filing", href: "/services/gst-consultation" },
  { name: "Accounting and CFO", href: "/services/accounting-support" },
  { name: "Contracts and agreements", href: "/services/contracts-agreements" },
];

const legalLinks = [
  { name: "Legal Services", href: "/services/legal-assistance" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer home-footer" style={{ background: "linear-gradient(135deg, #1a160e 0%, #4f3d21 50%, #1a160e 100%)", borderTop: "2px solid rgba(212,175,55,0.4)" }}>
      {/* Brand & Tagline Row */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 5% 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "25px" }}>
          <div>
            <h3 style={{ fontSize: "24px", fontWeight: "800", margin: 0, fontFamily: "Georgia, serif" }}>
              <span style={{ background: "linear-gradient(90deg, #d4af37, #f2d16b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NCJ</span>{" "}
              <span style={{ color: "#ffffff" }}>Legal LLP</span>
            </h3>
            <p style={{ fontSize: "14px", color: "#e8dcc4", opacity: 0.8, marginTop: "8px", maxWidth: "650px", lineHeight: "1.5" }}>
              Your trusted partner for all legal, tax, and business compliance needs. We bring decades of professional legacy to help you succeed.
            </p>
            <p style={{ fontSize: "13px", color: "#f2d16b", marginTop: "10px", marginBottom: 0 }}>
              Services: NGO, Section 8, GST, ITR, TDS, Accounting, Legal Drafting, Licenses, Registrations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Services Columns Grid */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 5% 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px" }}>
          
          {/* Column 1: Startup */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#f2d16b", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Startup
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
              {startupLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="footer-submenu-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Compliance */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#f2d16b", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Compliance
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
              {complianceLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="footer-submenu-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legal Services */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#f2d16b", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Legal Services
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
              {legalLinks.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="footer-submenu-link">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Horizontal Yellow/Gold Strip (Corporate Pages Links in Middle) */}
      <div style={{ background: "#d4af37", padding: "14px 5%" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
          {[
            { name: "About Us", href: "/about" },
            { name: "Services", href: "/services" },
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms & Conditions", href: "/terms" },
            { name: "Contact Us", href: "/contact" },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              style={{
                color: "#000000",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Dark Strip (Disclaimer, Contact details, & Copyright) */}
      <div style={{ background: "#110e09", padding: "30px 5%" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Contact Details row */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "30px", flexWrap: "wrap", fontSize: "13px", color: "#b8a88a" }}>
            <a 
              href="tel:+919999562401" 
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#b8a88a", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f2d16b'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b8a88a'}
            >
              <span>📞</span> +91 9999562401
            </a>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <a 
              href="mailto:info@ncjlegal.com" 
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#b8a88a", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f2d16b'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b8a88a'}
            >
              <span>✉️</span> info@ncjlegal.com
            </a>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
            <a 
              href="https://maps.app.goo.gl/ppqy2b4Q7NmqBaFh7" 
              target="_blank" 
              rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#b8a88a", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#f2d16b'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#b8a88a'}
            >
              <span>📍</span> Opposite of Purushottam Collection, Station Road Mainpuri.
            </a>
          </div>

          {/* Legal Disclaimer text */}
          <p style={{ fontSize: "12px", color: "#9a8d7a", opacity: 0.8, margin: 0, textAlign: "center", lineHeight: "1.7", maxWidth: "1000px", marginInline: "auto" }}>
            NCJ Legal Business Solutions LLP is an independent corporate consultancy and business advisory firm. We are a private entity providing professional legal, tax, and registration assistance, and we are not affiliated with, operated by, or representing any government body or department in India.
          </p>

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }}></div>

          {/* Copyright row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", fontSize: "12px", color: "#9a8d7a" }}>
            <p style={{ margin: 0 }}>
              © {year} <span style={{ color: "#d4af37", fontWeight: "600" }}>NCJ Legal LLP</span>. All rights reserved.
            </p>
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
              Made with <span style={{ color: "#d4af37" }}>♥</span> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
