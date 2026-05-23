import type { Metadata } from "next";
import LegalAssistancePage from "../../../components/services/LegalAssistancePage";

export const metadata: Metadata = {
  title: "Legal Services | NCJ Legal Business Solutions LLP",
  description: "Professional Legal Documentation, Litigation Support & Advisory Solutions. Comprehensive legal drafting, advisory, dispute management, documentation, and procedural support across India.",
};

export default function Page() {
  return <LegalAssistancePage />;
}