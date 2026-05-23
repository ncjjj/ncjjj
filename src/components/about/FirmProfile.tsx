"use client";

import { motion } from "framer-motion";
import type { MotionStyle } from "framer-motion";

export default function FirmProfile() {
  return (
    <section
      style={{
        padding: "64px 20px",
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
          <span style={badge}>FIRM PROFILE</span>

          <h2 className="about-heading" style={heading}>
            About <span style={goldText}>Our Firm</span>
          </h2>

          <p style={subText}>
            Delivering trusted legal and tax solutions with decades of expertise and client-first philosophy.
          </p>
        </motion.div>

        {/* CONTENT GRID */}
        <div className="about-firm-grid" style={grid}>
          
          {/* LEFT - TEXT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p style={para}>
              Our firm has been built on a strong foundation of integrity, precision, 
              and professional excellence. With decades of experience, we specialize in 
              delivering comprehensive legal and taxation services tailored to businesses 
              and individuals across India.
            </p>

            <p style={para}>
              From compliance and advisory to strategic financial planning, we ensure 
              our clients receive accurate, timely, and dependable solutions that help 
              them grow confidently.
            </p>

            <div style={points}>
              {[
                "Taxation & Compliance Services",
                "Legal Advisory & Documentation",
                "Business Registration & Structuring",
                "Audit & Financial Consulting",
              ].map((item, i) => (
                <div key={i} style={pointItem}>
                  <span style={dot}></span>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT - CARDS */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="about-right-grid"
            style={rightGrid}
          >
            {[
              { title: "Startups", desc: "Helping new ventures with registration & compliance" },
              { title: "SMEs", desc: "Supporting growth with financial & tax planning" },
              { title: "Corporates", desc: "Advanced legal and audit services" },
              { title: "Individuals", desc: "Personal taxation and advisory solutions" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                style={card}
              >
                <h3 style={cardTitle}>{item.title}</h3>
                <p style={cardDesc}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* BOTTOM LINE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={bottomText}
        >
          Trusted by businesses and individuals for consistent, reliable, and expert services.
        </motion.div>
      </div>
    </section>
  );
}

/* STYLES */

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "50px",
};

const rightGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const para = {
  fontSize: "15px",
  color: "#5a5040",
  lineHeight: "1.8",
  marginBottom: "20px",
};

const points = {
  marginTop: "20px",
};

const pointItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "10px",
  color: "#2c2416",
  fontWeight: "500",
};

const dot = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#d4af37",
};

const card = {
  background: "rgba(255,255,255,0.8)",
  padding: "20px",
  borderRadius: "16px",
  border: "1px solid rgba(212,175,55,0.2)",
  transition: "0.3s",
};

const cardTitle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#2c2416",
};

const cardDesc = {
  fontSize: "13px",
  color: "#5a5040",
  marginTop: "5px",
};

const bottomText: MotionStyle = {
  marginTop: "80px",
  textAlign: "center",
  fontSize: "15px",
  color: "#5a5040",
};

const badge = {
  padding: "8px 20px",
  borderRadius: "50px",
  background: "rgba(44,36,22,0.1)",
  border: "1px solid rgba(44,36,22,0.2)",
  fontSize: "12px",
};

const heading = {
  fontSize: "3rem",
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