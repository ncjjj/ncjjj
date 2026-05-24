import BusinessStartupPage from "../../../components/services/BusinessStartupPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Registration & Company Formation | NCJ Legal",
  description: "Company, LLP, OPC, partnership and proprietorship registration and post-incorporation compliance services.",
};

export default function BusinessSetupRoute() {
  return <BusinessStartupPage />;
}
