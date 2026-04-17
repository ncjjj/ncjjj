"use client";

import Link from "next/link";
import OfficeAddress from "../../components/contact/OfficeAddress";
import ContactDetails from "../../components/contact/ContactDetails";
import WhatsAppIntegration from "../../components/contact/WhatsAppIntegration";
import EnquiryForm from "../../components/contact/EnquiryForm";
import { useAuth } from "../../context/AuthContext";

export default function ContactPage() {
  const { user } = useAuth();

  return (
    <main>
      <section
        style={{
          paddingTop: "120px",
          paddingBottom: "24px",
          background: "linear-gradient(135deg, #faf6ed 0%, #f5e6c8 100%)",
          textAlign: "center",
        }}
      >
       
        {user ? (
          <p style={{ margin: 0, color: "#5a5040" }}>
            Signed in as {user.email}. Your enquiry details can be auto-filled.
          </p>
        ) : (
          <p style={{ margin: 0, color: "#5a5040" }}>
            Want faster enquiry submission? <Link href="/auth">Login or Sign Up</Link>
          </p>
        )}
      </section>
      <OfficeAddress />
      <ContactDetails />
      <WhatsAppIntegration />
      <EnquiryForm />
    </main>
  );
}
