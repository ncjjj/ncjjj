import BusinessStartupPage from "../../../components/services/BusinessStartupPage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Business Registration and Company Formation Services",
  description:
    "Company, LLP, OPC, partnership and proprietorship registration with post-incorporation compliance support for startups and businesses.",
  path: "/services/business-startup",
  keywords: [
    "company registration",
    "LLP registration",
    "OPC registration",
    "partnership firm registration",
    "startup compliance",
  ],
});

export default function BusinessSetupRoute() {
  return <BusinessStartupPage />;
}
