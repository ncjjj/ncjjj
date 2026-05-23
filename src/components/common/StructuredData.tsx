// JSON-LD Structured Data for SEO
export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "CA Firm",
    description:
      "Expert GST and ITR filing services with professional accounting support",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://yoursite.com",
    telephone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "+91XXXXXXXXXX",
    email: process.env.NEXT_PUBLIC_EMAIL || "info@cafrm.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: process.env.NEXT_PUBLIC_ADDRESS_STREET || "123 Street",
      addressLocality: process.env.NEXT_PUBLIC_ADDRESS_CITY || "City",
      addressRegion: process.env.NEXT_PUBLIC_ADDRESS_STATE || "State",
      postalCode: process.env.NEXT_PUBLIC_ADDRESS_ZIP || "000000",
      addressCountry: "IN",
    },
    areaServed: ["IN"],
    priceRange: "$$",
    sameAs: [
      process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
      process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
    ].filter(Boolean),
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "CA Firm",
    image: "/images/og-image.jpg",
    description: "Professional tax consultation and filing services",
    address: {
      "@type": "PostalAddress",
      streetAddress: process.env.NEXT_PUBLIC_ADDRESS_STREET || "123 Street",
      addressLocality: process.env.NEXT_PUBLIC_ADDRESS_CITY || "City",
      addressRegion: process.env.NEXT_PUBLIC_ADDRESS_STATE || "State",
      postalCode: process.env.NEXT_PUBLIC_ADDRESS_ZIP || "000000",
      addressCountry: "IN",
    },
    telephone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "+91XXXXXXXXXX",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://yoursite.com",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
    </>
  );
}
