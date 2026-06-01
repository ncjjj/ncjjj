// JSON-LD Structured Data for SEO
import {
  absoluteUrl,
  defaultDescription,
  siteName,
  siteUrl,
  socialImagePath,
} from "../../lib/siteMetadata";

export function StructuredData() {
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+91 9999562401";
  const email = process.env.NEXT_PUBLIC_EMAIL || "info@ncjlegal.com";
  const streetAddress =
    process.env.NEXT_PUBLIC_ADDRESS_STREET || "Mainpuri, Mainpuri - 205001";
  const addressLocality = process.env.NEXT_PUBLIC_ADDRESS_CITY || "Mainpuri";
  const addressRegion = process.env.NEXT_PUBLIC_ADDRESS_STATE || "Uttar Pradesh";
  const postalCode = process.env.NEXT_PUBLIC_ADDRESS_ZIP || "205001";
  const logo = absoluteUrl(socialImagePath);
  const serviceNames = [
    "GST Registration and Return Filing",
    "Income Tax Return Filing",
    "Business Registration",
    "Legal Documentation",
    "Accounting and Virtual CFO",
    "Government Licenses",
    "ISO Certification",
    "NGO Compliance",
    "FSSAI License",
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteName,
    description: defaultDescription,
    url: siteUrl,
    logo,
    image: logo,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
      addressCountry: "IN",
    },
    areaServed: ["IN"],
    priceRange: "INR",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${siteName} services`,
      itemListElement: serviceNames.map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name,
          provider: {
            "@type": "Organization",
            name: siteName,
          },
        },
      })),
    },
    sameAs: [
      process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
      process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
      process.env.NEXT_PUBLIC_LINKEDIN_URL || "",
    ].filter(Boolean),
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteName,
    image: logo,
    description: defaultDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      addressLocality,
      addressRegion,
      postalCode,
      addressCountry: "IN",
    },
    telephone: phone,
    email,
    url: siteUrl,
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
