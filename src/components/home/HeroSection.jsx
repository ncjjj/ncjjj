"use client";

import { useEffect, useState } from "react";
import sup from "../../../public/images/sup.jpg";
import sup2 from "../../../public/images/sup2.jpg";
import sup3 from "../../../public/images/sup3.jpg";

const banners = [sup, sup2, sup3];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Trigger animation on load
  useEffect(() => {
    setTimeout(() => setLoaded(true), 200);
  }, []);

  return (
    <div
      className="panel"
      style={{
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
        marginBottom: "0",
        position: "relative",
        zIndex: "2",
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND IMAGE SLIDER */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        {banners.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt="banner"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: currentIndex === i ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          />
        ))}

        {/* OVERLAY GRADIENT */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(10,10,10,0.85), rgba(30,25,10,0.8), rgba(15,15,15,0.9))",
          }}
        />
      </div>

      <section
        style={{
          width: "100%",
          minHeight: "100vh",
          padding: "40px 80px 80px 80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LEFT CONTENT */}
        <div
          style={{
            flex: 1,
            maxWidth: "600px",
            transform: loaded ? "translateX(0)" : "translateX(-80px)",
            opacity: loaded ? 1 : 0,
            transition: "all 0.8s ease",
          }}
        >
          {/* TRUST BADGES */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >
            {[
              "2000+ Clients Served",
              "Certified Experts",
              "Secure & Confidential",
            ].map((item, i) => (
              <span
                key={i}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px",
                  background: "rgba(212,175,55,0.15)",
                  border: "2px solid rgba(212,175,55,0.3)",
                  fontSize: "13px",
                  color: "#D4AF37",
                }}
              >
                {item}
              </span>
            ))}
          </div>

          {/* MAIN HEADING */}
          <h1
            style={{
              fontSize: "52px",
              fontWeight: "700",
              lineHeight: "1.2",
              marginTop: "0",
              marginBottom: "20px",
              color: "#D4AF37",
            }}
          >
           Focus on Business Leave the rest to us
          </h1>

          {/* GOLD LINE */}
          <div
            style={{
              width: "80px",
              height: "3px",
              background: "#D4AF37",
              marginBottom: "20px",
              borderRadius: "10px",
            }}
          />

          {/* TEXT */}
          <p
            style={{
              color: "#D4AF37",
              fontSize: "17px",
              marginBottom: "35px",
              lineHeight: "1.6",
            }}
          >
            Navigate complex regulations with clarity. We provide structured
            advisory, compliance support, and strategic insights tailored to
            individuals and growing businesses.
          </p>

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              style={{
                padding: "14px 30px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(90deg,#D4AF37,#F4E5C2)",
                color: "#000",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(212,175,55,0.4)",
              }}
            >
              Start Consultation
            </button>

            <button
              style={{
                padding: "14px 28px",
                borderRadius: "8px",
                border: "1px solid #D4AF37",
                background: "transparent",
                color: "#D4AF37",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Explore Services
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            flex: 1,
            height: "600px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transform: loaded ? "translateX(0)" : "translateX(80px)",
            opacity: loaded ? 1 : 0,
            transition: "all 1s ease",
            position: "relative",
          }}
        >
          {/* FLOATING CARD */}
          <div
            style={{
              position: "absolute",
              bottom: "80px",
              right: "20%",
              padding: "16px 22px",
              borderRadius: "12px",
              background: "linear-gradient(135deg,#D4AF37,#F4E5C2)",
              color: "#000",
              fontWeight: "600",
              boxShadow: "0 15px 40px rgba(212,175,55,0.4)",
            }}
          >
            Trusted by Professionals
          </div>
        </div>
      </section>
    </div>
  );
}