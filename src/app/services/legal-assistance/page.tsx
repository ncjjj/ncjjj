import LegalAssistancePage from "../../../components/services/LegalAssistancePage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Legal Documentation and Advisory Services",
  description:
    "Professional legal documentation, litigation support, advisory, dispute management, drafting and procedural support services across India.",
  path: "/services/legal-assistance",
  keywords: [
    "legal notice drafting",
    "legal documentation services",
    "agreement drafting",
    "litigation support",
    "business legal advisory",
  ],
});

export default function Page() {
  return <LegalAssistancePage />;
}
