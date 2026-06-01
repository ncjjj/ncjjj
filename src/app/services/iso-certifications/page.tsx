import IsoCertificationsPage from "../../../components/services/IsoCertificationsPage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "ISO Certification and Quality Compliance Services",
  description:
    "ISO 9001, ISO 14001, ISO 27001 and other international standards consultancy, documentation and certification support for businesses.",
  path: "/services/iso-certifications",
  keywords: [
    "ISO certification",
    "ISO 9001 certification",
    "ISO 27001 certification",
    "quality compliance consultant",
    "ISO consultant India",
  ],
});

export default function IsoPage() {
  return <IsoCertificationsPage />;
}
