"use client";

import { motion } from "framer-motion";

export default function Credentials() {
  return (
    <section
      style={{
        padding: "120px 20px",
        background:
          "linear-gradient(135deg, #faf6ed 0%, #f5e6c8 50%, #f0ddb0 100%)",
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
          <span style={badge}>CREDENTIALS</span>

          <h2 style={heading}>
            Our <span style={goldText}>Professional Standards</span>
          </h2>

          <p style={subText}>
            Recognized expertise backed by certifications, experience, and trust.
          </p>
        </motion.div>

        {/* CARDS */}
        <div style={grid}>
          {[
            {
              title: "Certified Experts",
              desc: "Team of qualified Chartered Accountants and legal professionals with verified credentials.",
              icon: "🎓",
            },
            {
              title: "Regulatory Compliance",
              desc: "Strict adherence to ICAI standards, legal frameworks, and ethical practices.",
              icon: "📜",
            },
            {
              title: "Years of Experience",
              desc: "Decades of combined industry experience serving businesses across India.",
              icon: "⏳",
            },
            {
              title: "Trusted Practice",
              desc: "Maintaining transparency, confidentiality, and client-first approach always.",
              icon: "🤝",
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

        {/* BOTTOM LINE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: "80px",
            textAlign: "center",
            color: "#5a5040",
            fontSize: "15px",
          }}
        >
          Committed to excellence, integrity, and long-term client success.
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
  background: "rgba(255,255,255,0.8)",
  borderRadius: "20px",
  padding: "30px",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(212,175,55,0.2)",
  transition: "0.3s",
};

const icon = {
  fontSize: "28px",
  marginBottom: "15px",
};

const cardTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2c2416",
  marginBottom: "10px",
};

const cardDesc = {
  fontSize: "14px",
  color: "#5a5040",
  lineHeight: "1.6",
};

const badge = {
  padding: "8px 20px",
  borderRadius: "50px",
  background: "rgba(44,36,22,0.1)",
  border: "1px solid rgba(44,36,22,0.2)",
  fontSize: "12px",
  letterSpacing: "1px",
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