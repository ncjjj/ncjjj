"use client";

import { motion } from "framer-motion";
import type { MotionStyle } from "framer-motion";

export default function ContactDetails() {
  return (
    <section
      className="contact-section contact-details"
      style={{
        padding: "64px 20px",
        background:
          "linear-gradient(135deg, #f0ddb0 0%, #f5e6c8 50%, #faf6ed 100%)",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <span style={badge}>CONTACT</span>

          <h2 style={heading}>
            Get in <span style={goldText}>Touch</span>
          </h2>

          <p style={subText}>
            Reach out to our experts for reliable and timely assistance.
          </p>
        </motion.div>

        {/* CONTACT CARDS */}
        <div className="contact-details-grid">
          
          {/* PHONE */}
          <motion.div
            whileHover={{ y: -5 }}
            style={card}
          >
            <div style={icon}>📞</div>
            <h3 style={cardTitle}>Call Us</h3>
            <p style={cardText}>+91 9999562401</p>
          </motion.div>

          {/* EMAIL */}
          <motion.div
            whileHover={{ y: -5 }}
            style={card}
          >
            <div style={icon}>✉️</div>
            <h3 style={cardTitle}>Email Us</h3>
            <p style={cardText}>info@cafirm.com</p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={ctaBox}
        >
          <p style={ctaText}>
            Reach out directly for quick assistance.
          </p>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="tel:+919999562401">
              <button style={primaryBtn}>Call Now</button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* STYLES */

const card: MotionStyle = {
  background: "rgba(255,255,255,0.85)",
  borderRadius: "20px",
  padding: "30px",
  border: "1px solid rgba(212,175,55,0.2)",
  textAlign: "center",
  transition: "0.3s",
};

const icon = {
  fontSize: "30px",
  marginBottom: "15px",
};

const cardTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2c2416",
};

const cardText = {
  fontSize: "15px",
  color: "#5a5040",
  marginTop: "8px",
};

const ctaBox: MotionStyle = {
  marginTop: "70px",
  textAlign: "center",
};

const ctaText = {
  fontSize: "15px",
  color: "#5a5040",
  marginBottom: "20px",
};

const primaryBtn = {
  padding: "12px 26px",
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