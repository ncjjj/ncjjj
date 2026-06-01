import GovRegistrationPage from "../../../components/services/GovRegistrationPage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Government Registration and Statutory Compliance Services",
  description:
    "MSME, IEC, EPF, ESI, RERA, export promotion, sector registration and statutory compliance support for businesses across India.",
  path: "/services/registration",
  keywords: [
    "MSME registration",
    "IEC registration",
    "EPF registration",
    "ESI registration",
    "RERA registration",
  ],
});

export default function RegistrationPage() {
  return <GovRegistrationPage />;
}
