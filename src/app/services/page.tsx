"use client";

import Link from "next/link";

const services = [
  { label: "Startup / Business Setup", href: "/services/business-setup" },
  { label: "Compliance / GST & Tax", href: "/services/gst-consultation" },
  { label: "Legal Services", href: "/services/legal-assistance" },
  { label: "Accounting & CFO", href: "/services/accounting-support" },
  { label: "Government Licenses", href: "/services/licenses" },
  { label: "Government Registration", href: "/services/registration" },
  { label: "ISO Certifications", href: "/services/iso-certifications" },
];

export default function ServicesPage() {
  return (
    <main className="site-page-main" style={{ paddingTop: 24, paddingBottom: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 12 }}>Our Services</h1>
      <p style={{ marginBottom: 18, color: '#555' }}>Select a service to learn more.</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, width: '100%' }}>
        {services.map((s) => (
          <li key={s.href}>
            <Link href={s.href} style={{ display: 'block', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)', textDecoration: 'none', color: '#111' }}>
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}