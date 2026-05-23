"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
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
            fontSize: "3rem",
            fontWeight: "700",
            color: "#2c2416",
            marginBottom: "10px",
          }}>
            Privacy Policy
          </h1>
          <p style={{
            color: "#5a5040",
            fontSize: "16px",
          }}>
            Your privacy is important to us. Learn how we protect your information.
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
              1. Introduction
            </h2>
            <p>
              NCJ Legal LLP ("Company," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </div>

          {/* Section 2 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              2. Information We Collect
            </h2>
            <p style={{ marginBottom: "15px" }}>
              We collect information in the following ways:
            </p>
            <ul style={{ marginLeft: "20px" }}>
              <li><strong>Personal Information:</strong> Name, email address, phone number, mailing address, PAN, Aadhaar number (with consent for compliance services), and GST registration details when you engage our services.</li>
              <li><strong>Financial Information:</strong> Bank account details and transaction information required for payment processing and compliance services.</li>
              <li><strong>Document Information:</strong> Tax returns, financial statements, and other documents you submit for filing and compliance purposes.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time and date of visit, and other analytics through cookies.</li>
              <li><strong>Communication Data:</strong> Messages, inquiries, and correspondence between you and our team.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              3. How We Use Your Information
            </h2>
            <p style={{ marginBottom: "15px" }}>
              We use the information we collect for the following purposes:
            </p>
            <ul style={{ marginLeft: "20px" }}>
              <li>To provide, maintain, and improve our services</li>
              <li>To process GST registrations, ITR filings, and other compliance services</li>
              <li>To communicate with you regarding your account and services</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To comply with legal and regulatory requirements</li>
              <li>To prevent fraud and enhance security</li>
              <li>To send promotional emails and newsletters (with your consent)</li>
              <li>To analyze website usage and improve user experience</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              4. Data Security
            </h2>
            <p>
              We implement appropriate technical, organizational, and physical security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your financial and sensitive data is encrypted and stored securely. However, no transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          {/* Section 5 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              5. Sharing Your Information
            </h2>
            <p style={{ marginBottom: "15px" }}>
              We do not sell or rent your personal information. We may share your information in the following circumstances:
            </p>
            <ul style={{ marginLeft: "20px" }}>
              <li><strong>Government Authorities:</strong> We are required to submit your information to tax authorities (Income Tax Department, GST Authority, etc.) for compliance filing purposes.</li>
              <li><strong>Service Providers:</strong> We may share information with third-party service providers who assist us in delivering our services (payment processors, document storage providers).</li>
              <li><strong>Legal Requirements:</strong> We will disclose information when required by law or to protect our legal rights.</li>
              <li><strong>Your Consent:</strong> We share information when you explicitly authorize us to do so.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              6. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Generally, we retain client information for a minimum of 7 years in accordance with tax compliance requirements in India. You can request deletion of your data, subject to legal and compliance obligations.
            </p>
          </div>

          {/* Section 7 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              7. Your Rights
            </h2>
            <p style={{ marginBottom: "15px" }}>
              You have the following rights regarding your personal information:
            </p>
            <ul style={{ marginLeft: "20px" }}>
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate information</li>
              <li>Right to request deletion (subject to compliance obligations)</li>
              <li>Right to opt-out of promotional communications</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent at any time</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              8. Cookies and Tracking Technologies
            </h2>
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience and analyze website usage. You can control cookie preferences through your browser settings. Note that disabling cookies may affect website functionality.
            </p>
          </div>

          {/* Section 9 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              9. Third-Party Links
            </h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of external sites. We encourage you to review the privacy policies of any third-party services before sharing your information.
            </p>
          </div>

          {/* Section 10 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              10. Children's Privacy
            </h2>
            <p>
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a minor, we will take steps to delete such information promptly.
            </p>
          </div>

          {/* Section 11 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              11. Data Protection Officer
            </h2>
            <p>
              If you have concerns about our data practices or wish to exercise your rights under data protection laws, you can contact our Data Protection Officer at info@ncjlegal.com.
            </p>
          </div>

          {/* Section 12 */}
          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              12. Changes to Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or applicable laws. We will notify you of significant changes by posting the updated policy on our website with an updated "Last Updated" date. Your continued use of our services following such notification constitutes your acceptance of the updated policy.
            </p>
          </div>

          {/* Section 13 */}
          <div style={{ marginBottom: "60px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#2c2416", marginBottom: "15px" }}>
              13. Contact Us
            </h2>
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
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
