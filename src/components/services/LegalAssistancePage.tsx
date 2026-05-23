"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { legalPageContent, legalServiceCategories } from "../../app/services/legal-assistance/data";
import type { LegalServiceItem } from "../../app/services/legal-assistance/data";
import NgoServiceEnquiryModal from "./NgoServiceEnquiryModal";

function ServiceCard({
  service,
  index,
  onRequest,
}: {
  service: LegalServiceItem;
  index: number;
  onRequest: (service: LegalServiceItem) => void;
}) {
  return (
    <motion.article
      id={service.id}
      className="ngo-service-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.2) }}
    >
      <h3 className="ngo-service-card__title">{service.title}</h3>
      <p className="ngo-service-card__summary">{service.summary}</p>

      <div className="ngo-service-card__columns">
        <div className="ngo-service-card__block">
          <h4 className="ngo-service-card__label">{service.assistanceLabel}</h4>
          <ul className="ngo-service-card__list">
            {service.assistance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="ngo-service-card__block ngo-service-card__block--benefits">
          <h4 className="ngo-service-card__label">Benefits</h4>
          <ul className="ngo-service-card__list ngo-service-card__list--benefits">
            {service.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <button type="button" className="ngo-service-card__cta" onClick={() => onRequest(service)}>
        Request Consultation
      </button>
    </motion.article>
  );
}

export default function LegalAssistancePage() {
  const { intro, supportPoints, industries, whyChoosePoints, ...hero } = legalPageContent;
  const [activeService, setActiveService] = useState<LegalServiceItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openEnquiry = (service: LegalServiceItem) => {
    setActiveService(service);
    setModalOpen(true);
  };

  return (
    <main className="ngo-page">
      <section className="ngo-hero">
        <div className="ngo-hero__inner">
          <motion.span
            className="ngo-hero__badge"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {hero.badge}
          </motion.span>

          <motion.h1
            className="ngo-hero__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            {hero.title}
          </motion.h1>

          <motion.p
            className="ngo-hero__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
          >
            {hero.subtitle}
          </motion.p>
        </div>
      </section>

      <section className="ngo-intro">
        <div className="ngo-container">
          {intro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="ngo-intro__text">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="ngo-services">
        <div className="ngo-container">
          <motion.h2
            className="ngo-section-title"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {hero.servicesHeading}
          </motion.h2>

          <nav className="ngo-toc" aria-label="Contracts and agreements categories">
            {legalServiceCategories.map((category) => (
              <a key={category.id} href={`#${category.id}`} className="ngo-toc__link">
                {category.title}
              </a>
            ))}
          </nav>

          {legalServiceCategories.map((category) => (
            <div key={category.id} id={category.id} className="ngo-category">
              <h3 className="ngo-category__title">{category.title}</h3>
              <div className="ngo-category__grid">
                {category.services.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} onRequest={openEnquiry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ngo-intro">
        <div className="ngo-container">
          <h2 className="ngo-section-title">{hero.supportHeading}</h2>
          <p className="ngo-intro__text">{hero.supportText}</p>
          <ul className="ngo-why__grid" style={{ marginTop: 24 }}>
            {supportPoints.map((point) => (
              <li
                key={point}
                className="ngo-why__item"
                style={{ color: "#3b3428" }}
              >
                <span
                  className="ngo-why__icon"
                  aria-hidden="true"
                  style={{ background: "rgba(184, 155, 94, 0.18)", color: "#8a7340" }}
                >
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ngo-intro">
        <div className="ngo-container">
          <h2 className="ngo-section-title">{hero.industriesHeading}</h2>
          <ul className="ngo-why__grid" style={{ marginTop: 24 }}>
            {industries.map((item) => (
              <li
                key={item}
                className="ngo-why__item"
                style={{ color: "#3b3428" }}
              >
                <span
                  className="ngo-why__icon"
                  aria-hidden="true"
                  style={{ background: "rgba(184, 155, 94, 0.18)", color: "#8a7340" }}
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ngo-why">
        <div className="ngo-container">
          <h2 className="ngo-section-title ngo-section-title--light">{hero.whyChooseHeading}</h2>
          <ul className="ngo-why__grid">
            {whyChoosePoints.map((point) => (
              <li key={point} className="ngo-why__item">
                <span className="ngo-why__icon" aria-hidden="true">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ngo-cta">
        <div className="ngo-container ngo-cta__inner">
          <h2 className="ngo-cta__title">{hero.ctaTitle}</h2>
          <p className="ngo-cta__text">{hero.ctaText}</p>
          <Link href="/contact" className="ngo-cta__button">
            {hero.ctaButton}
          </Link>
        </div>
      </section>

      <NgoServiceEnquiryModal service={activeService as any} open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}