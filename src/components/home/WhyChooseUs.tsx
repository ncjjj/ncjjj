"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const reasons = [
  {
    id: 1,
    icon: "👨‍⚖️",
    title: "Expert Professionals",
    description:
      "Our team consists of experienced CAs, lawyers, and tax experts with decades of combined experience in handling complex legal and financial matters.",
    stats: "25+ Years Experience",
  },
  {
    id: 2,
    icon: "⏰",
    title: "Timely Delivery",
    description:
      "We understand the importance of deadlines. Our streamlined processes ensure your filings are completed before due dates.",
    stats: "99% On-Time Rate",
  },
  {
    id: 3,
    icon: "💰",
    title: "Transparent Pricing",
    description:
      "No hidden charges or surprise fees. Clear, upfront pricing from the start.",
    stats: "Zero Hidden Fees",
  },
  {
    id: 4,
    icon: "🛡️",
    title: "100% Compliance",
    description:
      "Stay worry-free with full compliance and updated regulatory filings.",
    stats: "5000+ Filings Done",
  },
  {
    id: 5,
    icon: "🤝",
    title: "Personalized Support",
    description:
      "Dedicated experts providing tailored solutions for your business.",
    stats: "1-on-1 Consultation",
  },
  {
    id: 6,
    icon: "📱",
    title: "Digital First Approach",
    description:
      "Access everything anytime with our modern digital platform.",
    stats: "24/7 Portal Access",
  },
];

export default function WhyChooseUs() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <section
      className="home-why"
      style={{
        zIndex: 6,
        minHeight: "100vh",
        position: "relative",
        padding: "64px 20px",
        background:
          "linear-gradient(135deg, #faf6ed 0%, #f5e6c8 50%, #f0ddb0 100%)",
        width: "100%",
        overflow: "visible", // ✅ FIXED
        
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "70px" }}>
          <span style={badge}>WHY CHOOSE US</span>

          <h2 style={heading}>
            The <span style={goldText}>NCJ Advantage</span>
          </h2>

          <p style={subText}>
            Trusted by thousands of businesses across India for their legal and
            tax needs
          </p>
        </div>

        {/* GRID */}
        <div className="home-why-grid">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.id}
              onHoverStart={() => setActiveCard(reason.id)}
              onHoverEnd={() => setActiveCard(null)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="home-why-card"
              style={{
                ...card,
                ...(activeCard === reason.id ? activeCardStyle : {}),
              }}
            >
              {/* ICON */}
              <div style={iconBox(activeCard === reason.id)}>
                {reason.icon}
              </div>

              {/* TITLE */}
              <h3 style={title(activeCard === reason.id)}>
                {reason.title}
              </h3>

              {/* DESC */}
              <p style={desc(activeCard === reason.id)}>
                {reason.description}
              </p>

              {/* BADGE */}
              <div style={badgeStyle(activeCard === reason.id)}>
                {reason.stats}
              </div>
            </motion.div>
          ))}
        </div>

        {/* STATS */}
        <div className="home-why-stats">
          {[
            { number: "5000+", label: "Happy Clients" },
            { number: "25+", label: "Years Experience" },
            { number: "99%", label: "Success Rate" },
            { number: "50+", label: "Experts" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={statNumber}>{stat.number}</div>
              <div style={statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* STYLES */

const card = {
  background: "#fff",
  borderRadius: "20px",
  padding: "30px",
  transition: "0.3s",
  cursor: "pointer",
};

const activeCardStyle = {
  background: "#2c2416",
  color: "#fff",
  transform: "scale(1.03)",
};

const iconBox = (active: boolean) => ({
  fontSize: "30px",
  marginBottom: "20px",
});

const title = (active: boolean) => ({
  fontSize: "20px",
  fontWeight: "700",
  marginBottom: "10px",
  color: active ? "#f5e6c8" : "#2c2416",
});

const desc = (active: boolean) => ({
  fontSize: "14px",
  color: active ? "#c9b896" : "#555",
});

const badgeStyle = (active: boolean) => ({
  marginTop: "20px",
  fontSize: "13px",
  color: "#d4af37",
});

const statNumber = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#d4af37",
};

const statLabel = {
  fontSize: "14px",
};

const badge = {
  padding: "8px 20px",
  borderRadius: "50px",
  background: "#eee",
  fontSize: "12px",
};

const heading = {
  fontSize: "40px",
  marginTop: "20px",
};

const goldText = {
  color: "#d4af37",
};

const subText = {
  marginTop: "10px",
  color: "#555",
};