import type { Metadata } from "next";
import GstConsultationPage from "../../../components/services/GstConsultationPage";

export const metadata: Metadata = {
  title: "Tax Filing & Compliance Services | NCJ Legal",
  description:
    "GST registration, return filing, income tax filing, TDS compliance, tax notices, and corporate regulatory compliance services across India.",
};

export default function GstConsultationRoutePage() {
  return <GstConsultationPage />;
}
