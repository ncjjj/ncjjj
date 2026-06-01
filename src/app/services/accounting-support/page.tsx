import AccountingSupportPage from "../../../components/services/AccountingSupportPage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Accounting, Bookkeeping and Virtual CFO Services",
  description:
    "Accounting, audit, bookkeeping, MIS reporting, due diligence, and virtual CFO services for startups, MSMEs, corporates, and growing businesses across India.",
  path: "/services/accounting-support",
  keywords: [
    "bookkeeping services",
    "accounting services India",
    "virtual CFO services",
    "MIS reporting",
    "tax audit support",
  ],
});

export default function AccountingSupportRoutePage() {
  return <AccountingSupportPage />;
}
