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
    id: "service-level-agreement",
    title: "Service Level Agreement",
    description: "A Service Level Agreement (SLA) defines the scope, standards, timelines, responsibilities, and performance expectations between service providers and clients.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Customized SLA drafting",
      "Performance metric structuring",
      "Risk and liability clauses",
      "Confidentiality provisions",
      "Contract review and negotiation support"
    ],
    benefits: [
      "Clear definition of service obligations",
      "Reduced operational disputes",
      "Better accountability and transparency",
      "Protection of commercial interests"
    ]
  },
  {
    id: "share-purchase-agreement",
    title: "Share Purchase Agreement",
    description: "A Share Purchase Agreement (SPA) governs the purchase and sale of shares in a company.",
    assistanceLabel: "Our Services",
    assistance: [
      "Transaction structuring",
      "Share transfer documentation",
      "Due diligence support",
      "Payment and indemnity clauses",
      "Regulatory compliance advisory"
    ],
    benefits: [
      "Legally secure share transactions",
      "Protection of buyer and seller interests",
      "Clarity in ownership transfer",
      "Reduced transaction risks"
    ]
  },
  {
    id: "shareholders-agreement",
    title: "Shareholder’s Agreement",
    description: "A Shareholder’s Agreement defines rights, obligations, ownership structure, governance mechanisms, and dispute resolution among shareholders.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Shareholding structure advisory",
      "Voting rights and management clauses",
      "Exit and transfer restrictions",
      "Investor protection provisions",
      "Dispute resolution mechanisms"
    ],
    benefits: [
      "Better corporate governance",
      "Protection of shareholder interests",
      "Reduced future conflicts",
      "Clear business management framework"
    ]
  },
  {
    id: "franchise-agreement",
    title: "Franchise Agreement",
    description: "Franchise Agreements regulate the relationship between franchisors and franchisees for business expansion and brand licensing.",
    assistanceLabel: "Our Services",
    assistance: [
      "Franchise model structuring",
      "Licensing and royalty clauses",
      "Territorial rights drafting",
      "Compliance and operational clauses",
      "Brand protection provisions"
    ],
    benefits: [
      "Legally protected franchise operations",
      "Clear business expansion framework",
      "Intellectual property protection",
      "Reduced operational disputes"
    ]
  }
];

const servicesGroup2: ServiceData[] = [
  {
    id: "sale-deed-registration",
    title: "Sale Deed Registration",
    description: "Sale Deed Registration is essential for legal transfer of ownership in immovable property transactions.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Sale deed drafting",
      "Stamp duty advisory",
      "Registration coordination",
      "Property document verification",
      "Legal compliance support"
    ],
    benefits: [
      "Legally valid ownership transfer",
      "Protection against property disputes",
      "Clear title documentation",
      "Compliance with registration laws"
    ]
  },
  {
    id: "gift-deed",
    title: "Gift Deed",
    description: "A Gift Deed facilitates voluntary transfer of movable or immovable property without monetary consideration.",
    assistanceLabel: "Our Services",
    assistance: [
      "Gift deed drafting",
      "Family settlement advisory",
      "Registration support",
      "Stamp duty guidance"
    ],
    benefits: [
      "Legally recognized property transfer",
      "Smooth family asset transfer",
      "Reduced future inheritance disputes",
      "Proper legal documentation"
    ]
  },
  {
    id: "relinquishment-deed",
    title: "Relinquishment Deed",
    description: "Relinquishment Deed is used when a legal heir or co-owner voluntarily releases rights in a property.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Drafting and legal review",
      "Ownership rights verification",
      "Registration support",
      "Family settlement coordination"
    ],
    benefits: [
      "Clear transfer of ownership rights",
      "Reduction of future legal disputes",
      "Proper legal recognition of release"
    ]
  },
  {
    id: "probate-of-will",
    title: "Probate of Will",
    description: "Probate is the legal process through which a will is authenticated and executed under court supervision.",
    assistanceLabel: "Our Services",
    assistance: [
      "Probate petition drafting",
      "Court documentation support",
      "Legal representation coordination",
      "Estate documentation management"
    ],
    benefits: [
      "Legal recognition of the will",
      "Smooth estate transfer process",
      "Protection against inheritance disputes",
      "Court-authorized asset distribution"
    ]
  }
];

const servicesGroup3: ServiceData[] = [
  {
    id: "residential-rental-agreement",
    title: "Residential Rental Agreement",
    description: "Residential rental agreements define terms and conditions between landlords and tenants for residential properties.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Agreement drafting",
      "Security deposit clauses",
      "Tenancy condition structuring",
      "Registration support",
      "Renewal and amendment assistance"
    ],
    benefits: [
      "Legal protection for landlords and tenants",
      "Clear tenancy terms",
      "Reduced rental disputes",
      "Proper documentation of occupancy rights"
    ]
  },
  {
    id: "commercial-rental-agreement",
    title: "Commercial Rental Agreement",
    description: "Commercial lease agreements are designed for offices, shops, warehouses, factories, and business premises.",
    assistanceLabel: "Our Services",
    assistance: [
      "Commercial lease drafting",
      "Rent escalation and lock-in clauses",
      "Compliance and usage conditions",
      "Registration support"
    ],
    benefits: [
      "Protection of commercial interests",
      "Clear business occupancy rights",
      "Reduced operational disputes",
      "Structured leasing arrangements"
    ]
  }
];

export default function ContractsAgreementsPage() {
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
          <h1 className="web-hero-title">Contracts & Agreements Services</h1>
          <p className="web-hero-subtitle">
            Comprehensive Legal Documentation, Drafting & Registration Solutions
          </p>
        </section>

        {/* Intro Section */}
        <section className="web-intro-grid">
          <p className="web-intro-text">
            At NCJ Legal Business Solutions LLP, we provide professional drafting, vetting, review, execution, and registration support for commercial contracts, business agreements, property documents, and legal instruments across India.
          </p>
          <p className="web-intro-text">
            Well-drafted agreements are essential for protecting legal rights, defining obligations, minimizing disputes, and ensuring enforceability under applicable laws. Whether for business transactions, investments, partnerships, property dealings, franchise operations, or personal asset transfers, legally sound documentation plays a critical role in long-term security and operational clarity.
          </p>
          <p className="web-intro-text">
            Our experienced legal professionals assist clients in preparing customized agreements tailored to their commercial and legal requirements.
          </p>
        </section>

        {/* Category Navigation Bar */}
        <nav className="web-nav" aria-label="Services shortcuts">
          <Link href="#contracts-agreements" className="web-nav-link">Our Contracts & Agreements Services</Link>
          <Link href="#property-documentation" className="web-nav-link">Property Documentation & Registration</Link>
          <Link href="#rental-lease" className="web-nav-link">Rental & Lease Agreements</Link>
          <Link href="#support-services" className="web-nav-link">Documentation Support</Link>
          <Link href="#why-choose" className="web-nav-link">Why Choose Us</Link>
        </nav>

        {/* SECTION 1 */}
        <section id="contracts-agreements">
          <h2 className="web-section-title">Our Contracts & Agreements Services</h2>
          <div className="web-services-list">
            {servicesGroup1.map(renderServiceItem)}
          </div>
        </section>

        {/* SECTION 2 */}
        <section id="property-documentation">
          <h2 className="web-section-title">Property Documentation & Registration Services</h2>
          <div className="web-services-list">
            {servicesGroup2.map(renderServiceItem)}
          </div>
        </section>

        {/* SECTION 3 */}
        <section id="rental-lease">
          <h2 className="web-section-title">Rental & Lease Agreement Services</h2>
          <div className="web-services-list">
            {servicesGroup3.map(renderServiceItem)}
          </div>
        </section>

        {/* SECTION 4 - Support & Clients Split */}
        <section id="support-services" className="web-two-col">
          <div>
            <h2 className="web-section-title" style={{ fontSize: "1.4rem" }}>Our Legal Documentation Support</h2>
            <p className="web-service-desc" style={{ fontSize: "0.95rem", marginBottom: "20px" }}>
              At NCJ Legal Business Solutions LLP, we provide complete assistance throughout the documentation and agreement lifecycle:
            </p>
            <h4 className="web-detail-block-title">Services Include</h4>
            <ul className="web-list">
              <li className="web-list-item">Agreement drafting & vetting</li>
              <li className="web-list-item">Legal review and modification</li>
              <li className="web-list-item">Negotiation support</li>
              <li className="web-list-item">Stamp duty advisory</li>
              <li className="web-list-item">Registration coordination</li>
              <li className="web-list-item">Compliance verification</li>
              <li className="web-list-item">Dispute prevention advisory</li>
              <li className="web-list-item">Execution and documentation support</li>
            </ul>
          </div>

          <div>
            <h2 className="web-section-title" style={{ fontSize: "1.4rem" }}>Industries & Clients We Serve</h2>
            <p className="web-service-desc" style={{ fontSize: "0.95rem", marginBottom: "20px" }}>
              We provide contract drafting and legal documentation services for:
            </p>
            <h4 className="web-detail-block-title">Clients Include</h4>
            <ul className="web-list">
              <li className="web-list-item">Startups & Entrepreneurs</li>
              <li className="web-list-item">Corporates & MSMEs</li>
              <li className="web-list-item">Investors & Shareholders</li>
              <li className="web-list-item">Franchise Businesses</li>
              <li className="web-list-item">Property Owners & Developers</li>
              <li className="web-list-item">Manufacturers & Traders</li>
              <li className="web-list-item">Professionals & Consultants</li>
              <li className="web-list-item">Family-Owned Businesses</li>
              <li className="web-list-item">NRIs & Overseas Investors</li>
            </ul>
          </div>
        </section>

        {/* SECTION 5 - Why Choose Us */}
        <section id="why-choose" style={{ borderTop: "1px solid #d4af37", paddingTop: "50px" }}>
          <h2 className="web-section-title">Why Choose NCJ Legal Business Solutions LLP</h2>
          <div className="web-choose-grid">
            <div className="web-choose-item">60+ Years of Professional Legal & Tax Experience</div>
            <div className="web-choose-item">Experienced Corporate & Property Law Professionals</div>
            <div className="web-choose-item">Customized Agreement Drafting Solutions</div>
            <div className="web-choose-item">End-to-End Registration Support</div>
            <div className="web-choose-item">Strong Legal Documentation Expertise</div>
            <div className="web-choose-item">Transparent & Professional Advisory</div>
            <div className="web-choose-item">PAN India Service Support</div>
          </div>
        </section>
      </div>

      {/* SECTION 6 - Footer CTA Banner */}
      <section className="web-cta-banner">
        <div className="web-container">
          <h2 className="web-cta-banner-title">Secure Your Business & Property Transactions with Legally Strong Documentation</h2>
          <p className="web-cta-banner-desc">
            Whether you require commercial agreements, shareholder arrangements, franchise contracts, lease documentation, or property registration support, NCJ Legal Business Solutions LLP provides reliable and professionally structured legal documentation solutions tailored to your specific requirements.
          </p>
          <button
            type="button"
            className="web-cta-banner-btn"
            onClick={() =>
              openEnquiry({
                id: "contracts-general-consultation",
                title: "Contracts & Agreements Consultation",
                summary: "Secure your business and property transactions with legally strong documentation across India.",
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
