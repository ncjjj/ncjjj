"use client";

import { motion } from "framer-motion";

const features = [
  { icon: "⚡", text: "Quick Processing" },
  { icon: "🔒", text: "100% Secure" },
  { icon: "📞", text: "Expert Support" },
  { icon: "✅", text: "Guaranteed Filing" },
];

export default function FileReturnCTA() {
  return (
    <section 
      className="panel home-cta"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #b38535 20%, #1a160e 100%)",
        zIndex: 9999,
        width: "100%",
      }}
    >
      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        {/* Golden orbs */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(242,209,107,0.25) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />
        
        {/* Decorative lines */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.1 }}>
          <motion.line 
            x1="0" y1="30%" x2="100%" y2="70%"
            stroke="#d4af37" 
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.line 
            x1="100%" y1="20%" x2="0" y2="80%"
            stroke="#d4af37" 
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          />
        </svg>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 5%", maxWidth: "900px" }}>
        
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 24px",
            borderRadius: "50px",
            background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(242,209,107,0.1))",
            border: "1px solid rgba(212,175,55,0.4)",
            color: "#f2d16b",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "24px",
            letterSpacing: "1px",
          }}>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🎯
            </motion.span>
            LIMITED TIME OFFER
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="home-cta-heading"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontWeight: "800",
            color: "#f5e6c8",
            marginBottom: "20px",
            fontFamily: "Georgia, serif",
            lineHeight: "1.2",
          }}
        >
          Ready to File Your{" "}
          <span style={{
            background: "linear-gradient(90deg, #d4af37, #f2d16b, #d4af37)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 3s linear infinite",
          }}>
            Tax Return?
          </span>
        </motion.h2>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontSize: "18px",
            color: "#b8a88a",
            maxWidth: "600px",
            margin: "0 auto 40px",
            lineHeight: "1.7",
          }}
        >
          Get expert assistance for GST, Income Tax, and TDS filing. 
          Start today and stay compliant with ease.
        </motion.p>

        {/* Features */}
        <motion.div
          className="home-cta-features"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom: "50px",
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 20px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              <span style={{ fontSize: "20px" }}>{feature.icon}</span>
              <span style={{ color: "#e8dcc4", fontSize: "14px", fontWeight: "500" }}>
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="home-cta-actions"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Primary Button */}
          <motion.button
            className="home-cta-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "20px 48px",
              borderRadius: "60px",
              background: "linear-gradient(135deg, #d4af37, #f2d16b)",
              color: "#2c2416",
              fontSize: "18px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 15px 50px rgba(212,175,55,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: "Georgia, serif",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>File Your Return Now</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ position: "relative", zIndex: 1 }}
            >
              →
            </motion.span>
          </motion.button>

          {/* Secondary Button */}
          <motion.button
            className="home-cta-secondary"
            whileHover={{ scale: 1.05, background: "rgba(212,175,55,0.15)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "20px 40px",
              borderRadius: "60px",
              background: "transparent",
              color: "#f2d16b",
              fontSize: "18px",
              fontWeight: "600",
              border: "2px solid rgba(212,175,55,0.5)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
            }}
          >
            <span>📞</span>
            Talk to Expert
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          className="home-cta-trust"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            marginTop: "60px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            color: "#8a7d6a",
            fontSize: "14px",
          }}>
            <span style={{ color: "#d4af37" }}>★★★★★</span>
            <span>4.9/5 Rating</span>
          </div>
          <div style={{ 
            width: "1px", 
            height: "20px", 
            background: "rgba(212,175,55,0.3)" 
          }}></div>
          <div style={{ 
            color: "#8a7d6a",
            fontSize: "14px",
          }}>
            Trusted by <span style={{ color: "#d4af37", fontWeight: "600" }}>5000+</span> Businesses
          </div>
          <div style={{ 
            width: "1px", 
            height: "20px", 
            background: "rgba(212,175,55,0.3)" 
          }}></div>
          <div style={{ 
            color: "#8a7d6a",
            fontSize: "14px",
          }}>
            <span style={{ color: "#d4af37", fontWeight: "600" }}>100%</span> Secure Filing
          </div>
        </motion.div>
      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}
