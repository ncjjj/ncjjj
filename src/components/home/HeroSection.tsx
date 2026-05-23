"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import sup from "../../../public/images/sup.jpg";

const banner = sup;

export default function HeroSection() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [actionMessage, setActionMessage] = useState("");

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
        <img src={banner.src} alt="banner" className="bg-image" />
        <div className="home-hero-overlay" style={{ background: "linear-gradient(135deg, rgba(10,10,10,0.85), rgba(30,25,10,0.8), rgba(15,15,15,0.9))", position: 'absolute', inset: 0 }} />
      </div>

      <section className="home-hero-section">
        {/* LEFT CONTENT */}
        <div className="home-hero-copy">
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
        <div className="home-hero-visual">
          {/* FLOATING CARD */}
          <div className="home-hero-floating-card">Trusted by Professionals</div>
        </div>
      </section>
    </div>
  );
}