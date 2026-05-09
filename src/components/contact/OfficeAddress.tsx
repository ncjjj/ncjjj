"use client";

import { motion } from "framer-motion";

export default function OfficeAddress() {
  return (
    <section
      className="contact-section contact-office"
      style={{
        padding: "120px 20px",
        background:
          "linear-gradient(135deg, #f5e6c8 0%, #faf6ed 50%, #f0ddb0 100%)",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <span style={badge}>LOCATION</span>

          <h2 style={heading}>
            Visit Our <span style={goldText}>Office</span>
          </h2>

          <p style={subText}>
            We welcome you to connect with us in person at our office.
          </p>
        </motion.div>

        {/* CONTENT GRID */}
        <div style={grid}>
          
          {/* ADDRESS CARD */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={card}
          >
            <h3 style={cardTitle}>Office Address</h3>

            <p style={addressText}>
              NCJ & Associates<br />
              2nd Floor, Business Tower<br />
              MG Road, Indore, Madhya Pradesh<br />
              India - 452001
            </p>

            <div style={{ marginTop: "20px" }}>
              <p style={infoText}><strong>Working Hours:</strong> Mon - Sat, 10:00 AM - 7:00 PM</p>
              <p style={infoText}><strong>Nearby Landmark:</strong> Opp. City Mall</p>
            </div>

            <button style={mapBtn}>
              View on Google Maps
            </button>
          </motion.div>

          {/* MAP PLACEHOLDER */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={mapBox}
          >
            <div style={mapPlaceholder}>
              📍 Map Location
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* STYLES */

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "40px",
};

const card = {
  background: "rgba(255,255,255,0.85)",
  padding: "30px",
  borderRadius: "20px",
  border: "1px solid rgba(212,175,55,0.2)",
};

const cardTitle = {
  fontSize: "20px",
  fontWeight: "700",
  marginBottom: "15px",
  color: "#2c2416",
};

const addressText = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#5a5040",
};

const infoText = {
  fontSize: "14px",
  color: "#5a5040",
  marginBottom: "5px",
};

const mapBtn = {
  marginTop: "20px",
  padding: "12px 24px",
  borderRadius: "50px",
  border: "none",
  background: "linear-gradient(135deg, #d4af37, #c9a857)",
  color: "#2c2416",
  fontWeight: "600",
  cursor: "pointer",
};

const mapBox = {
  background: "rgba(255,255,255,0.6)",
  borderRadius: "20px",
  border: "1px solid rgba(212,175,55,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mapPlaceholder = {
  fontSize: "18px",
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