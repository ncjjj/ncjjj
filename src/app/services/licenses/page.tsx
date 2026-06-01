import GovLicensesPage from "../../../components/services/GovLicensesPage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Government Licenses and Regulatory Approval Services",
  description:
    "Licensing, certification and regulatory compliance services for shop licenses, trade licenses, factory licenses, product approvals and sector permissions.",
  path: "/services/licenses",
  keywords: [
    "government license consultant",
    "trade license",
    "shop establishment license",
    "factory license",
    "regulatory approval services",
  ],
});

export default function LicensesPage() {
  return <GovLicensesPage />;
}
