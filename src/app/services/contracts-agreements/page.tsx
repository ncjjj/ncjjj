import type { Metadata } from "next";
import ContractsAgreementsPage from "../../../components/services/ContractsAgreementsPage";

export const metadata: Metadata = {
  title: "Contracts & Agreements Services | NCJ Legal Business Solutions LLP",
  description: "Professional drafting, vetting, review, execution, and registration support for commercial contracts, business agreements, and property documents across India.",
};

export default function Page() {
  return <ContractsAgreementsPage />;
}
