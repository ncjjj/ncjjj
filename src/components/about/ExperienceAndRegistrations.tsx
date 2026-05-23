"use client";

import { motion } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import type { CSSProperties } from "react";

export default function ExperienceAndRegistrations() {
  return (
    <section
      style={{
        padding: "64px 20px",
        background:
          "linear-gradient(135deg, #f0ddb0 0%, #f5e6c8 50%, #faf6ed 100%)",
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
          <span style={badge}>EXPERIENCE</span>

          <h2 style={heading}>
            Experience & <span style={goldText}>Registrations</span>
          </h2>

          <p style={subText}>
            Proven track record backed by official registrations and years of trusted service.
          </p>
        </motion.div>

        {/* STATS ROW */}
        <div style={statsRow}>
          {[
            { number: "25+", label: "Years Experience" },
            { number: "5000+", label: "Clients Served" },
            { number: "99%", label: "Success Rate" },
            { number: "50+", label: "Expert Team" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={statCard}
            >
              <div style={statNumber}>{item.number}</div>
              <div style={statLabel}>{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* REGISTRATION BOX */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={regBox}
        >
          <h3 style={regTitle}>Registrations & Compliance</h3>

          <div style={regGrid}>
            {[
              "ICAI Registered Firm",
              "GST Registered",
              "MSME Registered",
              "Income Tax Certified",
              "ROC Compliance",
              "FCRA Advisory",
            ].map((item, i) => (
              <div key={i} style={regItem}>
                <span style={dot}></span>
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* STYLES */

const statsRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "80px",
};

const statCard: MotionStyle = {
  flex: "1 1 200px",
  textAlign: "center",
  padding: "20px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.6)",
  border: "1px solid rgba(212,175,55,0.2)",
};

const statNumber = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#d4af37",
};

const statLabel = {
  fontSize: "14px",
  color: "#5a5040",
};

const regBox = {
  background: "rgba(255,255,255,0.8)",
  padding: "40px",
  borderRadius: "20px",
  border: "1px solid rgba(212,175,55,0.2)",
};

const regTitle = {
  fontSize: "20px",
  fontWeight: "700",
  marginBottom: "20px",
  color: "#2c2416",
};

const regGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "15px",
};

const regItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
  color: "#5a5040",
};

const dot = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "#d4af37",
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