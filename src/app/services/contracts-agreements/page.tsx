import ContractsAgreementsPage from "../../../components/services/ContractsAgreementsPage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Contracts and Agreements Drafting Services",
  description:
    "Professional drafting, vetting, review, execution and registration support for commercial contracts, business agreements and property documents across India.",
  path: "/services/contracts-agreements",
  keywords: [
    "contract drafting",
    "agreement drafting services",
    "business agreement review",
    "property document registration",
    "commercial contracts India",
  ],
});

export default function Page() {
  return <ContractsAgreementsPage />;
}
