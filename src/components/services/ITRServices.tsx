"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import type { MotionStyle } from "framer-motion";

export default function ITRServices() {
  const router = useRouter();

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
          <span style={badge}>ITR SERVICES</span>

          <h2 style={heading}>
            Income Tax <span style={goldText}>Return Filing</span>
          </h2>

          <p style={subText}>
            Accurate and hassle-free income tax return filing tailored to your profile.
          </p>
        </motion.div>

        {/* SERVICES GRID */}
        <div style={grid}>
          {[
            {
              title: "Salaried Individuals",
              desc: "Efficient ITR filing for salaried professionals with deductions and tax optimization.",
              icon: "👔",
            },
            {
              title: "Business / Professionals",
              desc: "Comprehensive tax filing for freelancers, consultants, and business owners.",
              icon: "💼",
            },
            {
              title: "Firms & Companies",
              desc: "Structured and compliant ITR filing for partnerships, LLPs, and corporates.",
              icon: "🏢",
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

        {/* PROCESS STRIP (Premium touch) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={processBox}
        >
          {["Consultation", "Document Review", "Filing", "Verification"].map(
            (step, i) => (
              <div key={i} style={stepItem}>
                <div style={stepNumber}>{i + 1}</div>
                <span>{step}</span>
              </div>
            )
          )}
        </motion.div>

        {/* CTA */}
        <div style={ctaBox}>
          <p style={ctaText}>
            Ensure accurate filing and maximize your tax benefits with expert assistance.
          </p>
           <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold text-lg shadow-lg"
            onClick={() => router.push("/services/itr-filing")}
          >
            File Your ITR ✨
          </motion.button>
        </div>
      </div>
    </section>
  );
}

/* STYLES */

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "30px",
};

const card: MotionStyle = {
  background: "rgba(255,255,255,0.85)",
  borderRadius: "20px",
  padding: "30px",
  border: "1px solid rgba(212,175,55,0.2)",
  transition: "0.3s",
  cursor: "pointer",
};

const icon: CSSProperties = {
  fontSize: "28px",
  marginBottom: "15px",
};

const cardTitle: CSSProperties = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2c2416",
};

const cardDesc: CSSProperties = {
  fontSize: "14px",
  color: "#5a5040",
  marginTop: "8px",
  lineHeight: "1.6",
};

const processBox: MotionStyle = {
  marginTop: "80px",
  display: "flex",
  justifyContent: "center",
  gap: "30px",
  flexWrap: "wrap",
};

const stepItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: "#2c2416",
  fontWeight: "500",
};

const stepNumber: CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  background: "#d4af37",
  color: "#2c2416",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "700",
};

const ctaBox: CSSProperties = {
  marginTop: "60px",
  textAlign: "center",
};

const ctaText: CSSProperties = {
  fontSize: "15px",
  color: "#5a5040",
  marginBottom: "20px",
};

const ctaBtn: CSSProperties = {
  padding: "12px 28px",
  borderRadius: "50px",
  border: "none",
  background: "linear-gradient(135deg, #d4af37, #c9a857)",
  color: "#2c2416",
  fontWeight: "600",
  cursor: "pointer",
};

const badge: CSSProperties = {
  padding: "8px 20px",
  borderRadius: "50px",
  background: "rgba(44,36,22,0.1)",
  border: "1px solid rgba(44,36,22,0.2)",
  fontSize: "12px",
};

const heading: CSSProperties = {
  fontSize: "clamp(2rem, 5vw, 3rem)",
  marginTop: "20px",
  fontWeight: "700",
  color: "#2c2416",
  fontFamily: "Georgia, serif",
};

const goldText: CSSProperties = {
  color: "#d4af37",
};

const subText: CSSProperties = {
  marginTop: "10px",
  color: "#5a5040",
  fontSize: "16px",
};