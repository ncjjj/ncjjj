"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  const year = new Date().getFullYear();

  return (
    <main style={{ background: "#faf6ed" }}>
      {/* Header */}
      <section style={{
        padding: "80px 20px 40px",
        background: "linear-gradient(135deg, #f5e6c8 0%, #faf6ed 100%)",
        textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "700",
            color: "#2c2416",
            marginBottom: "10px",
          }}>
            Terms & Conditions
          </h1>
          <p style={{
            color: "#5a5040",
            fontSize: "16px",
          }}>
            Please read these terms carefully before using our services
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "60px 20px",
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ color: "#3b2f1c", lineHeight: "1.8" }}
        >
          {/* Section 1 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this website and services provided by NCJ Legal LLP, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          {/* Section 2 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on NCJ Legal LLP's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Attempt to gain unauthorized access to any portion or feature of the website</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              3. Disclaimer of Warranties
            </h2>
            <p>
              The materials on NCJ Legal LLP's website are provided on an 'as is' basis. NCJ Legal LLP makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </div>

          {/* Section 4 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              4. Limitations of Liability
            </h2>
            <p>
              In no event shall NCJ Legal LLP or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on NCJ Legal LLP's website, even if NCJ Legal LLP or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </div>

          {/* Section 5 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              5. Accuracy of Materials
            </h2>
            <p>
              The materials appearing on NCJ Legal LLP's website could include technical, typographical, or photographic errors. NCJ Legal LLP does not warrant that any of the materials on its website are accurate, complete, or current. NCJ Legal LLP may make changes to the materials contained on its website at any time without notice.
            </p>
          </div>

          {/* Section 6 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              6. Links to Third-Party Websites
            </h2>
            <p>
              NCJ Legal LLP has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by NCJ Legal LLP of the site. Use of any such linked website is at the user's own risk.
            </p>
          </div>

          {/* Section 7 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              7. Modifications of Terms
            </h2>
            <p>
              NCJ Legal LLP may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </div>

          {/* Section 8 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              8. Service Conditions
            </h2>
            <p style={{ marginBottom: "15px" }}>
              When you engage our services for GST registration, ITR filing, or other compliance services:
            </p>
            <ul style={{ marginLeft: "20px" }}>
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for the authenticity of documents submitted</li>
              <li>All filings are based on information provided by you</li>
              <li>You retain ultimate responsibility for all submissions to government authorities</li>
              <li>Our services are advisory in nature and should not replace professional audit or legal counsel where required</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              9. Confidentiality
            </h2>
            <p>
              All client information shared with NCJ Legal LLP is treated with strict confidentiality and is protected in accordance with applicable laws and our privacy policy. We will not disclose your information to third parties except as required by law.
            </p>
          </div>

          {/* Section 10 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              10. Governing Law
            </h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts located in Madhya Pradesh.
            </p>
          </div>

          {/* Section 11 */}
          <div style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              11. Contact Information
            </h2>
            <p>
              If you have any questions about these terms and conditions, please contact us at:
            </p>
            <div style={{ marginTop: "15px", color: "#5a5040" }}>
              <p><strong>NCJ Legal LLP</strong></p>
              <p>Email: info@ncjlegal.com</p>
              <p>Phone: +91 9999562401</p>
              <p>Address: Mainpuri, Mainpuri - 205001, India</p>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: "center",
            paddingTop: "40px",
            borderTop: "1px solid #d4af37",
            color: "#5a5040",
            fontSize: "14px",
          }}>
            <p>Last Updated: {year}</p>
            <p>© {year} NCJ Legal LLP. All rights reserved.</p>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
