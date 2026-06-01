import NgoServicesPage from "../../../components/services/NgoServicesPage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "NGO Registration and Charitable Trust Compliance Services",
  description:
    "End-to-end NGO registration, 12A, 80G, FCRA, CSR-1, compliance, and advisory services for trusts, societies, and Section 8 companies across India.",
  path: "/services/ngo",
  keywords: [
    "NGO registration",
    "12A registration",
    "80G registration",
    "FCRA registration",
    "Section 8 company registration",
  ],
});

export default function NgoPage() {
  return <NgoServicesPage />;
}
