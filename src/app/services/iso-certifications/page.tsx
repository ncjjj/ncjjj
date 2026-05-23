import IsoCertificationsPage from "../../../components/services/IsoCertificationsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ISO Certification Services | NCJ Legal",
  description: "ISO 9001, 14001, 27001 and other international standards consultancy and certification support.",
};

export default function IsoPage() {
  return <IsoCertificationsPage />;
}
