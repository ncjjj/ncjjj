import GstConsultationPage from "../../../components/services/GstConsultationPage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "GST Registration, ITR Filing and Tax Compliance Services",
  description:
    "GST registration, return filing, income tax filing, TDS compliance, tax notices, and corporate regulatory compliance services across India.",
  path: "/services/gst-consultation",
  keywords: [
    "GST registration consultant",
    "GST return filing",
    "income tax return filing",
    "TDS return filing",
    "tax notice support",
  ],
});

export default function GstConsultationRoutePage() {
  return <GstConsultationPage />;
}
