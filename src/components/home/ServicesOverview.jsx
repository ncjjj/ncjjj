"use client";

import { motion } from "framer-motion";

const services = [
  {
    title: "Tax Filing",
    icon: "📊",
    description: "Complete tax compliance solutions",
    items: ["GST Registration", "GST Return Filing", "TDS Filing", "Income Tax Filing"],
  },
  {
    title: "Legal Services",
    icon: "⚖️",
    description: "Expert legal documentation & advisory",
    items: ["Legal Notice", "Cheque Bounce", "Agreement Drafting", "POA & Will"],
  },
  {
    title: "NGO Services",
    icon: "🤝",
    description: "Non-profit registration & compliance",
    items: ["NGO Registration", "80G & 12A", "FCRA", "CSR Filing"],
  },
  {
    title: "Accounting",
    icon: "💼",
    description: "Professional bookkeeping & reports",
    items: ["Bookkeeping", "Financial Reports", "Tax Planning", "Audit Support"],
  },
  {
    title: "FSSAI",
    icon: "🍽️",
    description: "Food safety licensing & compliance",
    items: ["Food License", "FSSAI Registration", "Annual Returns", "Compliance"],
  },
  {
    title: "Business Setup",
    icon: "🚀",
    description: "Launch your business the right way",
    items: ["Startup India", "LLP Formation", "Private Ltd", "Partnership"],
  },
];

export default function ServicesOverview() {
  return (
    <section 
      // className="panel"
      style={{
        position: "relative",
        minHeight: "100vh",
        padding: "20px 5%",
        background: "linear-gradient(135deg, #2c2416 0%, #d79735 100%, #2c2416 0%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 99,
        width: "100%",
      }}
    >
      {/* Background glows */}
      <div style={{
        position: "absolute",
        top: "-10%",
        left: "10%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(80px)",
        pointerEvents: "none",
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "-5%",
        right: "5%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(100px)",
        pointerEvents: "none",
      }}></div>

      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "60px" }}
        >
          <span style={{
            display: "inline-block",
            padding: "3px 24px",
            borderRadius: "50px",
            background: "rgba(212,175,55,0.15)",
            border: "1px solid rgba(212,175,55,0.4)",
            color: "#f2d16b",
            fontSize: "14px",
            fontWeight: "500",
            marginBottom: "20px",
            letterSpacing: "1px",
          }}>
            WHAT WE OFFER
          </span>
          <h2 style={{
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
            fontWeight: "700",
            color: "#f5e6c8",
            marginBottom: "4px",
            fontFamily: "Georgia, serif",
          }}>
            Our Core <span style={{
              background: "linear-gradient(90deg, #d4af37, #f2d16b, #d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Services</span>
          </h2>
          <p style={{
            color: "#b8a88a",
            fontSize: "18px",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.2",
          }}>
            Comprehensive solutions for all your legal, tax, and business needs
          </p>
          <div style={{
            width: "80px",
            height: "2px",
            background: "linear-gradient(90deg, #d4af37, #f2d16b)",
            margin: "4px auto 0",
            borderRadius: "2px",
          }}></div>
        </motion.div>

        {/* Services Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              style={{
                position: "relative",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(250,246,237,0.95) 0%, rgba(245,230,200,0.95) 100%)",
                border: "1px solid rgba(212,175,55,0.3)",
                padding: "22px",
                cursor: "pointer",
                overflow: "hidden",
                boxShadow: "0 15px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)",
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #d4af37, #796834, #d4af37)",
                borderRadius: "20px 20px 0 0",
              }}></div>

              {/* Decorative corner */}
              <div 
             
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                width: "40px",
                height: "20px",
                borderTop: "2px solid rgba(212,175,55,0.3)",
                borderRight: "2px solid rgba(212,175,55,0.3)",
                borderRadius: "0 8px 0 0",
                
              }}></div>

              {/* Icon */}
              <motion.div
               whileHover={{scrollbarColor:2}}
                style={{
                width: "70px",
                height: "70px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #d4af37, #c9a857)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
                fontSize: "32px",
                boxShadow: "0 8px 25px rgba(212,175,55,0.4)",
              }}>
                {service.icon}
              </motion.div>

              {/* Title */}
              <h3 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#2c2416",
                marginBottom: "8px",
                fontFamily: "Georgia, serif",
              }}>
                {service.title}
              </h3>

              {/* Description */}
              <p style={{
                color: "#5a5040",
                fontSize: "14px",
                marginBottom: "20px",
                lineHeight: "1.5",
              }}>
                {service.description}
              </p>

              {/* Divider */}
              <div style={{
                height: "2px",
                width: "50px",
                background: "linear-gradient(90deg, #d4af37, #f2d16b)",
                marginBottom: "20px",
                borderRadius: "2px",
              }}></div>

              {/* Items */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {service.items.map((item, i) => (
                  <li key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    color: "#4a4035",
                    fontSize: "14px",
                    marginBottom: "12px",
                    paddingLeft: "4px",
                  }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #d4af37, #c9a857)",
                      flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(212,175,55,0.4)",
                    }}></span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Arrow button */}
              <div style={{
                position: "absolute",
                bottom: "24px",
                right: "24px",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #d4af37, #c9a857)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
              }}>
                <svg width="20" height="20" fill="none" stroke="#2c2416" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Bottom decorative line */}
              <div style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                width: "30px",
                height: "30px",
                borderBottom: "2px solid rgba(212,175,55,0.3)",
                borderLeft: "2px solid rgba(212,175,55,0.3)",
                borderRadius: "0 0 0 8px",
              }}></div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ textAlign: "center", marginTop: "60px" }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "18px 48px",
              borderRadius: "50px",
              background: "linear-gradient(135deg, #d4af37, #f2d16b)",
              color: "#2c2416",
              fontSize: "18px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 10px 40px rgba(212,175,55,0.4)",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.5px",
            }}
          >
            Explore All Services
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
