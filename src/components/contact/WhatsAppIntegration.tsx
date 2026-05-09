"use client";

import { motion } from "framer-motion";

export default function WhatsAppIntegration() {
  const whatsappNumber = "919999999999";
  const message = "Hello, I want help with GST/ITR filing.";
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <section
      className="contact-section contact-whatsapp"
      style={{
        padding: "100px 20px",
        background:
          "linear-gradient(135deg, #faf6ed 0%, #f5e6c8 50%, #f0ddb0 100%)",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span style={badge}>INSTANT SUPPORT</span>

          <h2 style={heading}>
            Chat on <span style={{ color: "#25D366" }}>WhatsApp</span>
          </h2>

          <p style={subText}>
            Get quick assistance for GST, ITR, and legal services directly from our experts.
          </p>
        </motion.div>

        {/* CTA CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={card}
        >
          <div style={icon}>💬</div>

          <h3 style={cardTitle}>Start a Conversation</h3>

          <p style={cardText}>
            Fast, reliable, and professional support — just one click away.
          </p>

          <a href={href} target="_blank" rel="noreferrer">
            <button style={whatsappBtn}>
              Chat on WhatsApp
            </button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* STYLES */

const card = {
  marginTop: "40px",
  padding: "40px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(212,175,55,0.2)",
  backdropFilter: "blur(10px)",
};

const icon = {
  fontSize: "32px",
  marginBottom: "15px",
};

const cardTitle = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#2c2416",
};

const cardText = {
  fontSize: "14px",
  color: "#5a5040",
  marginTop: "8px",
  marginBottom: "20px",
};

const whatsappBtn = {
  padding: "14px 30px",
  borderRadius: "50px",
  border: "none",
  background: "#25D366",
  color: "#fff",
  fontWeight: "600",
  fontSize: "15px",
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
  fontSize: "clamp(2rem, 5vw, 2.8rem)",
  marginTop: "20px",
  fontWeight: "700",
  color: "#2c2416",
  fontFamily: "Georgia, serif",
};

const subText = {
  marginTop: "10px",
  color: "#5a5040",
  fontSize: "15px",
};
