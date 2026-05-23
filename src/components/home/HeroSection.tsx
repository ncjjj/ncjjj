"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import sup from "../../../public/images/sup.jpg";
import sup2 from "../../../public/images/sup2.jpg";
import sup3 from "../../../public/images/sup3.jpg";

const banners = [sup, sup2, sup3];

export default function HeroSection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

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

  const ensureAuthenticated = () => {
    if (status !== "authenticated" || !session?.user) {
      router.push("/login?callbackUrl=/");
      return false;
    }

    return true;
  };

  const handleGetConsultant = async () => {
    if (!ensureAuthenticated()) {
      return;
    }

    const response = await fetch("/api/actions/get-consultant", { method: "POST" });
    const payload = await response.json();

    if (!response.ok) {
      setActionMessage(payload?.message || "Unable to process consultant request right now.");
      return;
    }

    setActionMessage("Consultant assigned successfully. Opening dashboard...");
    router.push("/dashboard");
  };



  return (
    <div className="panel home-hero">
      {/* BACKGROUND IMAGE SLIDER */}
      <div className="home-hero-bg">
        {banners.map((img, i) => (
          <img key={i} src={img.src} alt="banner" className="bg-image" style={{ opacity: currentIndex === i ? 1 : 0, transition: "opacity 1s ease-in-out" }} />
        ))}
        <div className="home-hero-overlay" style={{ background: "linear-gradient(135deg, rgba(10,10,10,0.85), rgba(30,25,10,0.8), rgba(15,15,15,0.9))", position: 'absolute', inset: 0 }} />
      </div>

      <section className="home-hero-section">
        {/* LEFT CONTENT */}
        <div className="home-hero-copy" style={{ transform: loaded ? "translateX(0)" : "translateX(-80px)", opacity: loaded ? 1 : 0, transition: "all 0.8s ease" }}>
          {/* TRUST BADGES */}
          <div
            className="home-hero-badges"
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
          <h1>Focus on Business Leave the rest to us</h1>

          {/* GOLD LINE */}
          <div style={{ width: "80px", height: "3px", background: "#D4AF37", marginBottom: "20px", borderRadius: "10px" }} />

          {/* TEXT */}
          <p>Navigate complex regulations with clarity. We provide structured advisory, compliance support, and strategic insights tailored to individuals and growing businesses.</p>

          {/* BUTTONS */}
          <div className="home-hero-actions" style={{ display: "flex", gap: "15px" }}>
            <button className="home-hero-primary" onClick={handleGetConsultant}>Get Consultant</button>
          </div>
          {actionMessage ? (
            <p
              style={{
                marginTop: "14px",
                color: "#D4AF37",
                fontSize: "14px",
              }}
            >
              {actionMessage}
            </p>
          ) : null}
        </div>

        {/* RIGHT SIDE */}
        <div className="home-hero-visual" style={{ transform: loaded ? "translateX(0)" : "translateX(80px)", opacity: loaded ? 1 : 0, transition: "all 1s ease" }}>
          {/* FLOATING CARD */}
          <div className="home-hero-floating-card">Trusted by Professionals</div>
        </div>
      </section>
    </div>
  );
}