import NgoServicesPage from "../../../components/services/NgoServicesPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NGO & Charitable Organization Services | NCJ Legal",
  description:
    "End-to-end NGO registration, 12A, 80G, FCRA, CSR-1, compliance, and advisory services for trusts, societies, and Section 8 companies across India.",
};

export default function NgoPage() {
  return <NgoServicesPage />;
}
