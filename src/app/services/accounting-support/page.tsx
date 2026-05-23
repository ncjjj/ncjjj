import type { Metadata } from "next";
import AccountingSupportPage from "../../../components/services/AccountingSupportPage";

export const metadata: Metadata = {
  title: "Accounting & CFO Services | NCJ Legal",
  description:
    "Accounting, audit, bookkeeping, MIS reporting, due diligence, and virtual CFO services for startups, MSMEs, corporates, and growing businesses across India.",
};

export default function AccountingSupportRoutePage() {
  return <AccountingSupportPage />;
}
