import ContactDetails from "../../components/contact/ContactDetails";
import { createPageMetadata } from "../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Contact NCJ Legal LLP",
  description:
    "Contact NCJ Legal LLP for GST, ITR, accounting, business registration, legal documentation and compliance service enquiries.",
  path: "/contact",
  keywords: [
    "contact tax consultant",
    "GST consultant contact",
    "ITR filing support",
    "business compliance consultation",
    "NCJ Legal contact",
  ],
});

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section
        className="contact-intro"
        style={{
          paddingTop: "120px",
          paddingBottom: "24px",
          background: "linear-gradient(135deg, #faf6ed 0%, #f5e6c8 100%)",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, color: "#5a5040" }}>
          Get in touch with us for expert assistance.
        </p>
      </section>
      <ContactDetails />
    </main>
  );
}
