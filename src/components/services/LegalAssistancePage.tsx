"use client";

import { useState } from "react";
import Link from "next/link";
import NgoServiceEnquiryModal from "./NgoServiceEnquiryModal";

interface ServiceItem {
  id: string;
  title: string;
  summary: string;
}

interface ServiceData {
  id: string;
  title: string;
  description: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
}

const servicesGroup1: ServiceData[] = [
  {
    id: "legal-notice",
    title: "Legal Notice",
    description: "A legal notice is a formal written communication sent to enforce legal rights, demand compliance, or initiate dispute resolution before litigation.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Legal notice drafting",
      "Case evaluation and legal advisory",
      "Recovery and contractual notices",
      "Property and commercial dispute notices",
      "Reply drafting support"
    ],
    benefits: [
      "Formal assertion of legal rights",
      "Opportunity for pre-litigation settlement",
      "Strong legal documentation",
      "Improved legal protection"
    ]
  },
  {
    id: "cheque-bounce-notice",
    title: "Cheque Bounce Notice",
    description: "Cheque bounce notices are issued under Section 138 of the Negotiable Instruments Act in cases of dishonoured cheques.",
    assistanceLabel: "Our Services",
    assistance: [
      "Demand notice drafting",
      "Legal compliance review",
      "Recovery strategy advisory",
      "Documentation support"
    ],
    benefits: [
      "Legal initiation of recovery proceedings",
      "Protection of financial interests",
      "Compliance with statutory timelines",
      "Strengthened legal position"
    ]
  },
  {
    id: "section-8-demand-notice",
    title: "Section 8 Demand Notice",
    description: "Section 8 demand notices are issued by operational creditors under the Insolvency and Bankruptcy Code (IBC).",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Demand notice drafting",
      "Operational debt verification",
      "Documentation and claim support",
      "Legal advisory for insolvency proceedings"
    ],
    benefits: [
      "Formal recovery mechanism",
      "Legal initiation under IBC",
      "Protection of creditor interests",
      "Structured debt recovery process"
    ]
  },
  {
    id: "rera-complaint",
    title: "RERA Complaint",
    description: "We assist homebuyers, investors, and developers in filing and managing complaints before the Real Estate Regulatory Authority (RERA).",
    assistanceLabel: "Our Services",
    assistance: [
      "Complaint drafting",
      "Documentation support",
      "Regulatory representation coordination",
      "Real estate dispute advisory"
    ],
    benefits: [
      "Legal remedy for real estate disputes",
      "Protection of buyer rights",
      "Faster dispute resolution mechanisms",
      "Regulatory compliance support"
    ]
  },
  {
    id: "caveat-petition",
    title: "Caveat Petition",
    description: "A caveat petition is filed to ensure that no adverse court order is passed without giving prior notice to the concerned party.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Caveat drafting and filing",
      "Court procedural advisory",
      "Legal documentation management"
    ],
    benefits: [
      "Protection against ex-parte orders",
      "Advance notice of legal proceedings",
      "Better litigation preparedness"
    ]
  }
];

const servicesGroup2: ServiceData[] = [
  {
    id: "legal-heir-certificate",
    title: "Legal Heir Certificate",
    description: "Legal heir certificates establish the relationship between deceased persons and their legal heirs.",
    assistanceLabel: "Our Services",
    assistance: [
      "Documentation assistance",
      "Application drafting",
      "Authority coordination",
      "Procedural advisory"
    ],
    benefits: [
      "Smooth transfer of assets and benefits",
      "Legal recognition of heirs",
      "Assistance in banking and property matters",
      "Reduced succession disputes"
    ]
  },
  {
    id: "succession-certificate-in-india",
    title: "Succession Certificate in India",
    description: "Succession certificates are required for claiming debts, securities, and financial assets of a deceased person.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Court petition drafting",
      "Documentation management",
      "Procedural compliance support",
      "Legal representation coordination"
    ],
    benefits: [
      "Legal authority to claim financial assets",
      "Protection of legal heir rights",
      "Smooth transfer of investments and securities"
    ]
  },
  {
    id: "will-drafting",
    title: "Will Drafting",
    description: "Will drafting helps individuals legally distribute assets and define succession arrangements after their lifetime.",
    assistanceLabel: "Our Services",
    assistance: [
      "Customized will drafting",
      "Family settlement advisory",
      "Asset structuring guidance",
      "Legal review and documentation"
    ],
    benefits: [
      "Proper estate planning",
      "Reduced inheritance disputes",
      "Clear asset distribution",
      "Protection of family interests"
    ]
  },
  {
    id: "power-of-attorney",
    title: "Power of Attorney (POA)",
    description: "Power of Attorney authorizes a person to act legally on behalf of another individual or entity.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "General and special POA drafting",
      "Property and business authorization documents",
      "Registration support",
      "NRI documentation assistance"
    ],
    benefits: [
      "Legally authorized representation",
      "Simplified property and business management",
      "Efficient handling of legal transactions",
      "Support for remote decision-making"
    ]
  }
];

const servicesGroup3: ServiceData[] = [
  {
    id: "lease-agreement-drafting",
    title: "Lease Agreement Drafting",
    description: "We provide professionally drafted lease agreements for residential, commercial, industrial, and institutional properties.",
    assistanceLabel: "Our Services",
    assistance: [
      "Lease agreement drafting",
      "Tenancy terms structuring",
      "Lock-in and rent clauses",
      "Registration support",
      "Renewal and amendment assistance"
    ],
    benefits: [
      "Legal protection for landlords and tenants",
      "Clearly defined occupancy rights",
      "Reduced tenancy disputes",
      "Structured leasing arrangements"
    ]
  }
];

export default function LegalAssistancePage() {
  const [activeService, setActiveService] = useState<ServiceItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openEnquiry = (service: ServiceItem) => {
    setActiveService(service);
    setModalOpen(true);
  };

  const renderServiceItem = (service: ServiceData) => (
    <div key={service.id} id={service.id} className="web-service-row">
      <h3 className="web-service-title">{service.title}</h3>
      <p className="web-service-desc">{service.description}</p>
      
      <div className="web-service-details-grid">
        <div>
          <h4 className="web-detail-block-title">{service.assistanceLabel}</h4>
          <ul className="web-list">
            {service.assistance.map((item, idx) => (
              <li key={idx} className="web-list-item">{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="web-detail-block-title">Benefits</h4>
          <ul className="web-list">
            {service.benefits.map((item, idx) => (
              <li key={idx} className="web-list-item">{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        className="web-btn"
        onClick={() =>
          openEnquiry({
            id: service.id,
            title: service.title,
            summary: service.description,
          })
        }
      >
        Get Consultant
      </button>
    </div>
  );

  return (
    <main className="web-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .web-page {
          background-color: #ffffff;
          color: #111111;
          font-family: "Inter", -apple-system, sans-serif;
          line-height: 1.6;
          padding-top: 80px; /* offset for fixed header */
        }

        .web-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero banner style */
        .web-hero {
          padding: 80px 0 60px 0;
          border-bottom: 2px solid #d4af37; /* Gold website accent */
          margin-bottom: 50px;
        }

        .web-hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -1.5px;
          line-height: 1.1;
          margin-bottom: 20px;
          color: #111111;
        }

        .web-hero-subtitle {
          font-size: 1.4rem;
          font-weight: 500;
          color: #b89b5e; /* Website Gold */
          max-width: 850px;
          line-height: 1.4;
        }

        .web-intro-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
          margin-bottom: 60px;
        }

        .web-intro-text {
          font-size: 1.15rem;
          color: #333333;
          line-height: 1.8;
          max-width: 900px;
        }

        /* Table of Contents Navigation */
        .web-nav {
          display: flex;
          gap: 25px;
          margin-bottom: 40px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 15px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .web-nav::-webkit-scrollbar {
          display: none;
        }

        .web-nav-link {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          text-decoration: none;
          color: #666666;
          white-space: nowrap;
          letter-spacing: 1px;
          transition: color 0.25s ease;
        }

        .web-nav-link:hover {
          color: #d4af37; /* Gold hover */
        }

        .web-section-title {
          font-size: 1.8rem;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 30px;
          letter-spacing: -0.5px;
          border-bottom: 2px solid #d4af37; /* Gold accent */
          padding-bottom: 8px;
          margin-top: 40px;
          color: #111111;
        }

        /* Service row styling - Stacking layout */
        .web-service-row {
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 45px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .web-service-row:last-of-type {
          border-bottom: none;
        }

        .web-service-title {
          font-size: 1.7rem;
          font-weight: 800;
          line-height: 1.25;
          text-transform: uppercase;
          margin: 0;
          letter-spacing: -0.5px;
          color: #b89b5e; /* Gold color for titles */
        }

        .web-service-desc {
          font-size: 1.1rem;
          color: #333333;
          margin: 0;
          line-height: 1.7;
        }

        .web-service-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .web-detail-block-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          color: #666666;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
        }

        .web-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .web-list-item {
          font-size: 0.95rem;
          margin-bottom: 8px;
          position: relative;
          padding-left: 20px;
          color: #222222;
          line-height: 1.5;
        }

        .web-list-item::before {
          content: "✓"; /* Gold checkmark marker */
          position: absolute;
          left: 0;
          color: #d4af37;
          font-weight: bold;
          font-size: 0.85rem;
          line-height: 1.3;
        }

        /* Modern interactive website gold button */
        .web-btn {
          align-self: flex-start;
          background: linear-gradient(135deg, #d4af37, #c9a857); /* Gold gradient */
          color: #ffffff;
          border: none;
          padding: 12px 28px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .web-btn:hover {
          background: #111111; /* Dark hover */
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(212, 175, 55, 0.35);
        }

        /* Two Column Layout */
        .web-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 60px 0;
          border-top: 1px solid #d4af37; /* Gold divider */
        }

        /* Simple Cardless Why Choose list */
        .web-choose-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px 40px;
          margin-top: 30px;
          margin-bottom: 50px;
        }

        .web-choose-item {
          font-size: 1.05rem;
          font-weight: 600;
          color: #111111;
          padding-left: 25px;
          position: relative;
        }

        .web-choose-item::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #d4af37;
          font-weight: bold;
        }

        /* Web Page Bottom Footer Banner - White Background */
        .web-cta-banner {
          background-color: #ffffff; /* White background */
          color: #111111;
          padding: 80px 24px;
          text-align: center;
          margin-top: 60px;
          border-top: 2px solid #d4af37; /* Gold accent line */
        }

        .web-cta-banner-title {
          font-size: 2.2rem;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: -0.5px;
          color: #111111;
        }

        .web-cta-banner-desc {
          font-size: 1.15rem;
          color: #444444;
          max-width: 750px;
          margin: 0 auto 35px auto;
          line-height: 1.7;
        }

        .web-cta-banner-btn {
          background: linear-gradient(135deg, #d4af37, #c9a857); /* Gold gradient */
          color: #ffffff;
          border: none;
          padding: 14px 32px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .web-cta-banner-btn:hover {
          background: #111111;
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .web-page {
            padding-top: 60px;
          }
          .web-hero {
            padding: 50px 0 40px 0;
          }
          .web-hero-title {
            font-size: 2.5rem;
          }
          .web-service-row {
            padding: 35px 0;
          }
          .web-service-details-grid {
            grid-template-columns: 1fr;
            gap: 25px;
          }
          .web-two-col {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 40px 0;
          }
          .web-cta-banner {
            padding: 60px 16px;
          }
          .web-cta-banner-title {
            font-size: 1.7rem;
          }
        }
      `}} />

      <div className="web-container">
        {/* Hero Section */}
        <section className="web-hero">
          <h1 className="web-hero-title">Legal Services</h1>
          <p className="web-hero-subtitle">
            Professional Legal Documentation, Litigation Support & Advisory Solutions
          </p>
        </section>

        {/* Intro Section */}
        <section className="web-intro-grid">
          <p className="web-intro-text">
            At NCJ Legal Business Solutions LLP, we provide comprehensive legal drafting, advisory, dispute management, documentation, and procedural support services for individuals, businesses, property owners, startups, corporates, and organizations across India.
          </p>
          <p className="web-intro-text">
            Legal documentation and timely legal action are essential for protecting rights, enforcing obligations, resolving disputes, and ensuring regulatory compliance. Our experienced legal professionals assist clients in handling commercial disputes, property matters, contractual issues, succession planning, recovery proceedings, and statutory legal requirements with professionalism and strategic legal guidance.
          </p>
          <p className="web-intro-text">
            We focus on providing legally sound, professionally drafted, and practical solutions tailored to the client’s specific legal and commercial requirements.
          </p>
        </section>

        {/* Category Navigation Bar */}
        <nav className="web-nav" aria-label="Services shortcuts">
          <Link href="#our-legal-services" className="web-nav-link">Our Legal Services</Link>
          <Link href="#property-succession" className="web-nav-link">Property & Succession</Link>
          <Link href="#lease-documentation" className="web-nav-link">Lease Documentation</Link>
          <Link href="#support-services" className="web-nav-link">Support & Clients</Link>
          <Link href="#why-choose" className="web-nav-link">Why Choose Us</Link>
        </nav>

        {/* SECTION 1 */}
        <section id="our-legal-services">
          <h2 className="web-section-title">Our Legal Services</h2>
          <div className="web-services-list">
            {servicesGroup1.map(renderServiceItem)}
          </div>
        </section>

        {/* SECTION 2 */}
        <section id="property-succession">
          <h2 className="web-section-title">Property, Family & Succession Legal Services</h2>
          <div className="web-services-list">
            {servicesGroup2.map(renderServiceItem)}
          </div>
        </section>

        {/* SECTION 3 */}
        <section id="lease-documentation">
          <h2 className="web-section-title">Property & Lease Documentation Services</h2>
          <div className="web-services-list">
            {servicesGroup3.map(renderServiceItem)}
          </div>
        </section>

        {/* SECTION 4 - Support & Clients Split */}
        <section id="support-services" className="web-two-col">
          <div>
            <h2 className="web-section-title" style={{ fontSize: "1.4rem" }}>Our Legal Support Services</h2>
            <p className="web-service-desc" style={{ fontSize: "0.95rem", marginBottom: "20px" }}>
              At NCJ Legal Business Solutions LLP, we provide complete legal support including:
            </p>
            <h4 className="web-detail-block-title">Services Include</h4>
            <ul className="web-list">
              <li className="web-list-item">Legal drafting & documentation</li>
              <li className="web-list-item">Litigation support advisory</li>
              <li className="web-list-item">Regulatory compliance guidance</li>
              <li className="web-list-item">Court and authority procedural support</li>
              <li className="web-list-item">Property and succession documentation</li>
              <li className="web-list-item">Commercial dispute assistance</li>
              <li className="web-list-item">Legal consultation & review</li>
            </ul>
          </div>

          <div>
            <h2 className="web-section-title" style={{ fontSize: "1.4rem" }}>Clients We Serve</h2>
            <p className="web-service-desc" style={{ fontSize: "0.95rem", marginBottom: "20px" }}>
              We provide legal services for:
            </p>
            <h4 className="web-detail-block-title">Target Client Groups</h4>
            <ul className="web-list">
              <li className="web-list-item">Individuals & Families</li>
              <li className="web-list-item">Startups & Entrepreneurs</li>
              <li className="web-list-item">Corporates & MSMEs</li>
              <li className="web-list-item">Property Owners & Investors</li>
              <li className="web-list-item">Landlords & Tenants</li>
              <li className="web-list-item">Builders & Developers</li>
              <li className="web-list-item">NRIs & Overseas Clients</li>
              <li className="web-list-item">Creditors & Financial Institutions</li>
            </ul>
          </div>
        </section>

        {/* SECTION 5 - Why Choose Us */}
        <section id="why-choose" style={{ borderTop: "1px solid #d4af37", paddingTop: "50px" }}>
          <h2 className="web-section-title">Why Choose NCJ Legal Business Solutions LLP</h2>
          <div className="web-choose-grid">
            <div className="web-choose-item">60+ Years of Professional Legal & Tax Experience</div>
            <div className="web-choose-item">Experienced Legal Drafting & Advisory Team</div>
            <div className="web-choose-item">Personalized Legal Solutions</div>
            <div className="web-choose-item">End-to-End Documentation Support</div>
            <div className="web-choose-item">Strong Expertise in Commercial & Property Matters</div>
            <div className="web-choose-item">Transparent & Professional Advisory</div>
            <div className="web-choose-item">PAN India Legal Assistance</div>
          </div>
        </section>
      </div>

      {/* SECTION 6 - Footer CTA Banner */}
      <section className="web-cta-banner">
        <div className="web-container">
          <h2 className="web-cta-banner-title">Reliable Legal Solutions Backed by Professional Expertise</h2>
          <p className="web-cta-banner-desc">
            Whether you require legal notices, recovery support, property documentation, succession planning, contractual drafting, or regulatory complaint assistance, NCJ Legal Business Solutions LLP provides dependable and professionally managed legal services tailored to your legal and commercial objectives.
          </p>
          <button
            type="button"
            className="web-cta-banner-btn"
            onClick={() =>
              openEnquiry({
                id: "general-consultation",
                title: "General Legal Consultation",
                summary: "Reliable legal solutions backed by professional expertise across India.",
              })
            }
          >
            Connect With Us Today
          </button>
        </div>
      </section>

      <NgoServiceEnquiryModal
        service={activeService as any}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}