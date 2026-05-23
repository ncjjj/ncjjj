"use client";

import { motion } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export default function EnquiryForm() {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.mobileNumber || prev.phone,
      }));
    }
  }, [user]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const existing = JSON.parse(localStorage.getItem("ncj-enquiries") || "[]");
    const entry = {
      ...formData,
      userId: user?.id || null,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("ncj-enquiries", JSON.stringify([entry, ...existing]));
    setStatus("Your enquiry was submitted. Our team will contact you soon.");
    setFormData((prev) => ({ ...prev, message: "" }));
  };

  return (
    <section className="contact-section contact-enquiry">
      <div style={{ maxWidth: "650px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginBottom: "50px" }}>
          <span style={badge}>ENQUIRY</span>

          <h2 style={heading}>
            Send Your <span style={goldText}>Query</span>
          </h2>

          <p style={subText}>
            Our team will get back to you within 24 hours.
          </p>
        </motion.div>

        {/* FORM */}
        <motion.form initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="form-card" onSubmit={handleSubmit}>
          {user ? (
            <p style={signedInTag}>Signed in as {user.email}</p>
          ) : null}

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="input"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            style={input}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Your Phone Number"
            style={input}
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <textarea name="message" placeholder="Your Query" rows={4} className="input" style={{ resize: "none" }} value={formData.message} onChange={handleChange} required />

          <button type="submit" className="submit-btn">Submit Enquiry</button>

          {status ? <p style={statusText}>{status}</p> : null}
        </motion.form>
      </div>
    </section>
  );
}

/* STYLES */

const formCard: MotionStyle = {
  background: "rgba(255,255,255,0.9)",
  padding: "40px",
  borderRadius: "20px",
  border: "1px solid rgba(212,175,55,0.2)",
  display: "flex",
  flexDirection: "column",
  gap: "18px",
  backdropFilter: "blur(10px)",
};

const input = {
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid rgba(0,0,0,0.1)",
  fontSize: "14px",
  outline: "none",
  transition: "0.3s",
};

const submitBtn = {
  marginTop: "10px",
  padding: "14px",
  borderRadius: "50px",
  border: "none",
  background: "linear-gradient(135deg, #d4af37, #c9a857)",
  color: "#2c2416",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
};

const badge = {
  padding: "8px 20px",
  borderRadius: "50px",
  background: "rgba(44,36,22,0.1)",
  border: "1px solid rgba(44,36,22,0.2)",
  fontSize: "12px",
};

const heading = {
  fontSize: "2.8rem",
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
  fontSize: "15px",
};

const signedInTag = {
  margin: 0,
  padding: "10px 12px",
  borderRadius: "10px",
  background: "rgba(44,36,22,0.08)",
  border: "1px solid rgba(44,36,22,0.15)",
  color: "#4a3d2b",
  fontSize: "13px",
};

const statusText = {
  margin: 0,
  color: "#3e5f27",
  fontSize: "14px",
  fontWeight: "500",
};