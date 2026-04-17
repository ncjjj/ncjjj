"use client";

import { motion } from "framer-motion";

export default function GSTServices() {
  return (
    <section
      style={{
        padding: "120px 20px",
        background:
          "linear-gradient(135deg, #f5e6c8 0%, #faf6ed 50%, #f0ddb0 100%)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "70px" }}
        >
          <span style={badge}>GST SERVICES</span>

          <h2 style={heading}>
            Comprehensive <span style={goldText}>GST Solutions</span>
          </h2>

          <p style={subText}>
            Simplifying GST compliance with accurate, timely, and reliable services.
          </p>
        </motion.div>

        {/* SERVICES GRID */}
        <div style={grid}>
          {[
            {
              title: "GST Registration",
              desc: "End-to-end assistance for new GST registration and amendments.",
              icon: "📄",
            },
            {
              title: "Return Filing",
              desc: "Monthly, quarterly, and annual GST returns filed accurately.",
              icon: "📊",
            },
            {
              title: "Annual GST Return",
              desc: "Comprehensive annual return preparation and submission.",
              icon: "🧾",
            },
            {
              title: "Notices & Compliance",
              desc: "Handling GST notices, replies, and ongoing compliance support.",
              icon: "⚖️",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              style={card}
            >
              <div style={icon}>{item.icon}</div>

              <h3 style={cardTitle}>{item.title}</h3>
              <p style={cardDesc}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={ctaBox}
        >
          <p style={ctaText}>
            Need help with GST compliance? Our experts ensure error-free filings and timely submissions.
          </p>

            <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold text-lg shadow-lg"
          >
            Get Consultation ✨
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

/* STYLES */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "30px",
};

const card = {
  background: "rgba(255,255,255,0.85)",
  borderRadius: "20px",
  padding: "30px",
  border: "1px solid rgba(212,175,55,0.2)",
  transition: "0.3s",
  cursor: "pointer",
};

const icon = {
  fontSize: "28px",
  marginBottom: "15px",
};

const cardTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2c2416",
};

const cardDesc = {
  fontSize: "14px",
  color: "#5a5040",
  marginTop: "8px",
  lineHeight: "1.6",
};

const ctaBox = {
  marginTop: "80px",
  textAlign: "center",
};

const ctaText = {
  fontSize: "15px",
  color: "#5a5040",
  marginBottom: "20px",
};

const ctaBtn = {
  padding: "12px 28px",
  borderRadius: "50px",
  border: "none",
  background: "linear-gradient(135deg, #d4af37, #c9a857)",
  color: "#2c2416",
  fontWeight: "600",
  cursor: "pointer",
};

const badge = {
  padding: "8px 20px",
  borderRadius: "50px",
  background: "rgba(44,36,22,0.1)",
  border: "1px solid rgba(44,36,22,0.2)",
  fontSize: "12px",
};

const heading = {
  fontSize: "clamp(2rem, 5vw, 3rem)",
  marginTop: "20px",
  fontWeight: "700",
  color: "#2c2416",
  fontFamily: "Georgia, serif",
};

const goldText = {
  color: "#d4af37",
};

const subText = {
  marginTop: "10px",
  color: "#5a5040",
  fontSize: "16px",
};