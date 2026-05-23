"use client";

import { useState } from "react";
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
    id: "fssai-license",
    title: "FSSAI License",
    description: "FSSAI License is mandatory for all food business operators involved in manufacturing, processing, storage, transportation, distribution, or sale of food products in India.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Eligibility assessment",
      "License category selection",
      "Documentation preparation",
      "Online application filing",
      "Departmental coordination",
      "Compliance advisory"
    ],
    benefits: [
      "Legal authorization for food business operations",
      "Compliance with food safety laws",
      "Consumer trust enhancement",
      "Business credibility improvement",
      "Eligibility for organized retail and online platforms"
    ]
  },
  {
    id: "fssai-state-license",
    title: "FSSAI State License",
    description: "State FSSAI License is applicable to medium-sized food businesses operating within a particular state and falling under prescribed turnover limits.",
    assistanceLabel: "Our Services",
    assistance: [
      "State license application filing",
      "Documentation support",
      "Inspection advisory",
      "Renewal and modification assistance"
    ],
    benefits: [
      "Legal food business operations within the state",
      "Regulatory compliance",
      "Improved market reputation",
      "Protection against penalties"
    ]
  },
  {
    id: "central-fssai-license",
    title: "Central FSSAI License",
    description: "Central FSSAI License is mandatory for large food businesses, importers, exporters, e-commerce food operators, and businesses operating in multiple states.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Central license registration",
      "Documentation and compliance management",
      "Product category advisory",
      "Government coordination"
    ],
    benefits: [
      "Nationwide food business operations",
      "Import-export eligibility",
      "Large-scale operational approval",
      "Enhanced business credibility"
    ]
  },
  {
    id: "fssai-license-renewal",
    title: "FSSAI License Renewal",
    description: "Timely renewal of FSSAI licenses is essential to ensure uninterrupted legal operations and avoid penalties.",
    assistanceLabel: "Our Services",
    assistance: [
      "Renewal filing",
      "Compliance review",
      "Documentation updates",
      "Modification support"
    ],
    benefits: [
      "Continuous validity of food license",
      "Avoidance of penalties and disruptions",
      "Smooth business continuity",
      "Updated regulatory compliance"
    ]
  },
  {
    id: "eating-house-license",
    title: "Eating House License",
    description: "Eating House License is mandatory for restaurants, cafes, hotels, cloud kitchens, and establishments serving food and beverages to customers.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "License application support",
      "Police and local authority coordination",
      "Documentation management",
      "Regulatory compliance advisory"
    ],
    benefits: [
      "Legal operation of restaurants and eateries",
      "Local authority compliance",
      "Consumer confidence",
      "Protection against operational penalties"
    ]
  }
];

const servicesGroup2: ServiceData[] = [
  {
    id: "fssai-annual-return",
    title: "FSSAI Annual Return",
    description: "Certain categories of food businesses are required to file annual returns under FSSAI regulations.",
    assistanceLabel: "Our Services",
    assistance: [
      "Annual return preparation",
      "Filing assistance",
      "Compliance review",
      "Record maintenance guidance"
    ],
    benefits: [
      "Statutory compliance",
      "Avoidance of late fees and penalties",
      "Proper regulatory reporting",
      "Smooth inspection handling"
    ]
  },
  {
    id: "fssai-product-approval",
    title: "FSSAI Product Approval",
    description: "We assist businesses in obtaining approvals for proprietary food products, ingredients, formulations, and imported food items.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Product documentation support",
      "Ingredient compliance review",
      "Label compliance advisory",
      "Regulatory coordination"
    ],
    benefits: [
      "Legal approval for food products",
      "Faster market entry",
      "Compliance with food safety standards",
      "Reduced regulatory risks"
    ]
  },
  {
    id: "food-recycling-license",
    title: "Food Recycling License",
    description: "Food recycling and waste management businesses require regulatory approvals and compliance certifications for lawful operations.",
    assistanceLabel: "Our Services",
    assistance: [
      "License advisory",
      "Environmental and food compliance support",
      "Documentation management",
      "Regulatory coordination"
    ],
    benefits: [
      "Legal food waste management operations",
      "Environmental compliance",
      "Sustainable business practices",
      "Operational legitimacy"
    ]
  },
  {
    id: "fpo-mark-certification",
    title: "FPO Mark Certification",
    description: "FPO certification applies to manufacturers dealing with fruit and processed fruit products.",
    assistanceLabel: "Our Assistance",
    assistance: [
      "Certification support",
      "Product compliance guidance",
      "Regulatory documentation",
      "Departmental coordination"
    ],
    benefits: [
      "Product quality recognition",
      "Food processing compliance",
      "Enhanced market trust",
      "Improved product credibility"
    ]
  }
];

export default function FssaiEatingHousePage() {
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
          <h1 className="web-hero-title">FSSAI & Eating House License Services</h1>
          <p className="web-hero-subtitle">
            Complete Food Business Licensing, Regulatory Compliance & Food Safety Solutions
          </p>
        </section>

        {/* Intro Section */}
        <section className="web-intro-grid">
          <p className="web-intro-text">
            At NCJ Legal Business Solutions LLP, we provide comprehensive consultancy and end-to-end assistance for FSSAI registrations, food business licenses, eating house approvals, food safety compliance, and regulatory certifications across India.
          </p>
          <p className="web-intro-text">
            Food businesses operating in manufacturing, processing, packaging, storage, transportation, distribution, catering, restaurants, cloud kitchens, cafes, hotels, bakeries, import-export, and food retail sectors are required to obtain appropriate food safety registrations and licenses under the Food Safety and Standards Act, 2006.
          </p>
          <p className="web-intro-text">
            Our experienced legal and compliance professionals assist food businesses in obtaining licenses efficiently while ensuring complete compliance with applicable food safety regulations and statutory requirements.
          </p>
        </section>

        {/* Category Navigation Bar */}
        <nav className="web-nav" aria-label="Services shortcuts">
          <a href="#fssai-licensing" className="web-nav-link">Our FSSAI & Food Licensing Services</a>
          <a href="#food-safety-compliance" className="web-nav-link">Food Safety Compliance & Regulatory Services</a>
          <a href="#support-services" className="web-nav-link">Compliance Support</a>
          <a href="#why-choose" className="web-nav-link">Why Choose Us</a>
        </nav>

        {/* SECTION 1 */}
        <section id="fssai-licensing">
          <h2 className="web-section-title">Our FSSAI & Food Licensing Services</h2>
          <div className="web-services-list">
            {servicesGroup1.map(renderServiceItem)}
          </div>
        </section>

        {/* SECTION 2 */}
        <section id="food-safety-compliance">
          <h2 className="web-section-title">Food Safety Compliance & Regulatory Services</h2>
          <div className="web-services-list">
            {servicesGroup2.map(renderServiceItem)}
          </div>
        </section>

        {/* SECTION 3 - Support & Clients Split */}
        <section id="support-services" className="web-two-col">
          <div>
            <h2 className="web-section-title" style={{ fontSize: "1.4rem" }}>Our End-to-End Compliance Support</h2>
            <p className="web-service-desc" style={{ fontSize: "0.95rem", marginBottom: "20px" }}>
              At NCJ Legal Business Solutions LLP, we provide complete support throughout the food licensing and compliance process:
            </p>
            <h4 className="web-detail-block-title">Services Include</h4>
            <ul className="web-list">
              <li className="web-list-item">License registration & renewal</li>
              <li className="web-list-item">Food safety compliance advisory</li>
              <li className="web-list-item">Labeling & packaging guidance</li>
              <li className="web-list-item">Regulatory documentation support</li>
              <li className="web-list-item">Inspection and audit assistance</li>
              <li className="web-list-item">Return filing & compliance management</li>
              <li className="web-list-item">Legal and departmental representation</li>
            </ul>
          </div>

          <div>
            <h2 className="web-section-title" style={{ fontSize: "1.4rem" }}>Businesses We Serve</h2>
            <p className="web-service-desc" style={{ fontSize: "0.95rem", marginBottom: "20px" }}>
              We provide FSSAI and food licensing consultancy for:
            </p>
            <h4 className="web-detail-block-title">Food Business Operators</h4>
            <ul className="web-list">
              <li className="web-list-item">Restaurants & Cafes</li>
              <li className="web-list-item">Cloud Kitchens</li>
              <li className="web-list-item">Food Manufacturers</li>
              <li className="web-list-item">Food Importers & Exporters</li>
              <li className="web-list-item">Hotels & Bakeries</li>
              <li className="web-list-item">Catering Services</li>
              <li className="web-list-item">Grocery & Retail Stores</li>
              <li className="web-list-item">Food Processing Units</li>
              <li className="web-list-item">Packaged Food Businesses</li>
              <li className="web-list-item">Dairy & Beverage Companies</li>
              <li className="web-list-item">E-commerce Food Sellers</li>
            </ul>
          </div>
        </section>

        {/* SECTION 4 - Why Choose Us */}
        <section id="why-choose" style={{ borderTop: "1px solid #d4af37", paddingTop: "50px" }}>
          <h2 className="web-section-title">Why Choose NCJ Legal Business Solutions LLP</h2>
          <div className="web-choose-grid">
            <div className="web-choose-item">60+ Years of Professional Experience</div>
            <div className="web-choose-item">Specialized Food Law & Compliance Experts</div>
            <div className="web-choose-item">End-to-End FSSAI & Food Licensing Support</div>
            <div className="web-choose-item">PAN India Professional Assistance</div>
            <div className="web-choose-item">Transparent & Timely Processing</div>
            <div className="web-choose-item">Industry-Specific Compliance Solutions</div>
            <div className="web-choose-item">Strong Expertise in Regulatory & Government Liaison</div>
          </div>
        </section>
      </div>

      {/* SECTION 5 - Footer CTA Banner */}
      <section className="web-cta-banner">
        <div className="web-container">
          <h2 className="web-cta-banner-title">Simplifying Food Business Compliance with Professional Expertise</h2>
          <p className="web-cta-banner-desc">
            Whether you are launching a new food venture, expanding operations, importing food products, operating restaurants, or managing large-scale food manufacturing activities, NCJ Legal Business Solutions LLP provides reliable and professional food licensing solutions to keep your business legally compliant and growth-ready.
          </p>
          <button
            type="button"
            className="web-cta-banner-btn"
            onClick={() =>
              openEnquiry({
                id: "fssai-general-consultation",
                title: "FSSAI & Food Licensing Consultation",
                summary: "Simplifying food business compliance with professional food safety and licensing expertise across India.",
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
