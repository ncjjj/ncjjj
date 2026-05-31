"use client";

import { useState } from "react";
import Link from "next/link";
import NgoServiceEnquiryModal from "./NgoServiceEnquiryModal";

export interface ServiceItem {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
}

export interface ServiceCategory {
  id: string;
  title: string;
  services: ServiceItem[];
}

export interface PageContent {
  badge: string;
  title: string;
  subtitle: string;
  intro: string[];
  servicesHeading: string;
  whyChooseHeading: string;
  whyChoosePoints: string[];
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
}

interface GenericServicePageProps {
  pageContent: PageContent;
  serviceCategories: ServiceCategory[];
}

export default function GenericServicePage({ pageContent, serviceCategories }: GenericServicePageProps) {
  const [activeService, setActiveService] = useState<{ id: string; title: string; summary: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openEnquiry = (service: { id: string; title: string; summary: string }) => {
    setActiveService(service);
    setModalOpen(true);
  };

  const renderServiceItem = (service: ServiceItem) => (
    <div key={service.id} id={service.id} className="web-service-row">
      <h3 className="web-service-title">{service.title}</h3>
      <p className="web-service-desc">{service.summary}</p>
      
      <div className="web-service-details-grid">
        <div>
          <h4 className="web-detail-block-title">{service.assistanceLabel || "Our Assistance"}</h4>
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
            summary: service.summary,
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
          <h1 className="web-hero-title">{pageContent.title}</h1>
          <p className="web-hero-subtitle">{pageContent.subtitle}</p>
        </section>

        {/* Intro Section */}
        <section className="web-intro-grid">
          {pageContent.intro.map((para, idx) => (
            <p key={idx} className="web-intro-text">{para}</p>
          ))}
        </section>

        {/* Category Navigation Bar */}
        <nav className="web-nav" aria-label="Services shortcuts">
          {serviceCategories.map((category) => (
            <Link key={category.id} href={`#${category.id}`} className="web-nav-link">
              {category.title}
            </Link>
          ))}
          <Link href="#why-choose" className="web-nav-link">Why Choose Us</Link>
        </nav>

        {/* Services Grouping */}
        {serviceCategories.map((category) => (
          <section key={category.id} id={category.id} style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
            <h2 className="web-section-title">{category.title}</h2>
            <div className="web-services-list">
              {category.services.map(renderServiceItem)}
            </div>
          </section>
        ))}

        {/* SECTION 5 - Why Choose Us */}
        <section id="why-choose" style={{ borderTop: "1px solid #d4af37", paddingTop: "50px" }}>
          <h2 className="web-section-title">{pageContent.whyChooseHeading || "Why Choose Us"}</h2>
          <div className="web-choose-grid">
            {pageContent.whyChoosePoints.map((point, idx) => (
              <div key={idx} className="web-choose-item">{point}</div>
            ))}
          </div>
        </section>
      </div>

      {/* SECTION 6 - Footer CTA Banner */}
      <section className="web-cta-banner">
        <div className="web-container">
          <h2 className="web-cta-banner-title">{pageContent.ctaTitle}</h2>
          <p className="web-cta-banner-desc">{pageContent.ctaText}</p>
          <button
            type="button"
            className="web-cta-banner-btn"
            onClick={() =>
              openEnquiry({
                id: "general-consultation",
                title: pageContent.title,
                summary: pageContent.ctaText,
              })
            }
          >
            {pageContent.ctaButton || "Connect With Us Today"}
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
