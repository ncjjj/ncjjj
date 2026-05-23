import GovLicensesPage from "../../../components/services/GovLicensesPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Government Licenses & Regulatory Approvals | NCJ Legal",
  description: "Licensing, certification and regulatory compliance services for businesses across India.",
};

export default function LicensesPage() {
  return <GovLicensesPage />;
}
