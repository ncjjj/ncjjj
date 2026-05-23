import GovRegistrationPage from "../../../components/services/GovRegistrationPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Government Registration Services | NCJ Legal",
  description: "MSME, IEC, EPF, ESI, RERA, export and sector registrations across India.",
};

export default function RegistrationPage() {
  return <GovRegistrationPage />;
}
