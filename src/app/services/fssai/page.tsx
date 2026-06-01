import FssaiEatingHousePage from "../../../components/services/FssaiEatingHousePage";
import { createPageMetadata } from "../../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "FSSAI License and Eating House License Services",
  description:
    "Complete food business licensing, food safety compliance, FSSAI registration, FSSAI renewal and eating house license approvals across India.",
  path: "/services/fssai",
  keywords: [
    "FSSAI license",
    "FSSAI registration",
    "eating house license",
    "food business license",
    "FSSAI renewal",
  ],
});

export default function FssaiPage() {
  return <FssaiEatingHousePage />;
}
