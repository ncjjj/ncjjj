"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const footerLinks = {
  services: [
    { name: "GST Registration", href: "/services/gst" },
    { name: "Income Tax Filing", href: "/services/itr" },
    { name: "TDS Returns", href: "/services/tds" },
    { name: "Legal Services", href: "/services/legal" },
    { name: "NGO Registration", href: "/services/ngo" },
    { name: "FSSAI License", href: "/services/fssai" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer home-footer">
      <div className="decor-line" />
      <div className="decor-circle" />

      {/* Main Footer Content */}
      <div className="site-footer-inner">
        <div className="site-footer-columns">
          
          {/* Brand Column */}
          <div className="footer-brand" style={{ maxWidth: "300px" }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3>
                <span style={{ background: "linear-gradient(90deg, #d4af37, #f2d16b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NCJ</span>{" "}
                <span style={{ color: "#f5e6c8" }}>Legal LLP</span>
              </h3>
              <p>
                Your trusted partner for all legal, tax, and business compliance needs. We bring decades of expertise to help you navigate complex regulations with ease.
              </p>
              
              {/* Contact Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <a href="tel:+919999562401">📞 +91 9999562401</a>
                <a href="mailto:info@ncjlegal.com">✉️ info@ncjlegal.com</a>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "#9a8d7a", fontSize: "14px" }}>
                  <span>📍</span>
                  <span>Mainpuri<br />Mainpuri - 205001</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Services Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#f2d16b",
              marginBottom: "24px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
              Services
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {footerLinks.services.map((link, i) => (
                <li key={i} style={{ marginBottom: "12px" }}>
                  <Link href={link.href} style={{
                    color: "#9a8d7a",
                    textDecoration: "none",
                    fontSize: "14px",
                    transition: "all 0.3s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#d4af37",
                      opacity: 0.5,
                    }}></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
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
