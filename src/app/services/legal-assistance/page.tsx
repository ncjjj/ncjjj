import type { Metadata } from "next";
import LegalAssistancePage from "../../../components/services/LegalAssistancePage";

export const metadata: Metadata = {
  title: "Contracts & Agreements Services | NCJ Legal Business Solutions LLP",
  description: "Professional contracts, agreements, property documentation, lease deeds and registration support across India.",
};

export default function Page() {
  return <LegalAssistancePage />;
}