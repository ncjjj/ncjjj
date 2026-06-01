import HeroSection from "../components/home/HeroSection";
import AboutCAFirm from "../components/home/AboutCAFirm";
import ServicesOverview from "../components/home/ServicesOverview";
import WhyChooseUs from "../components/home/WhyChooseUs";
// Removed ProcessFlow and FileReturnCTA as requested
import MyClients from "../components/home/MyClients";
import { createPageMetadata } from "../lib/siteMetadata";

export const metadata = {
  ...createPageMetadata({
    title: "GST, ITR, Legal and Business Compliance Services",
    description:
      "Get GST registration, ITR filing, tax compliance, accounting, business registration, legal documentation and licensing support from NCJ Legal LLP.",
    path: "/",
    keywords: [
      "GST filing services",
      "ITR filing services",
      "business compliance services",
      "legal business solutions",
      "company registration consultant",
    ],
  }),
  title: {
    absolute: "NCJ Legal LLP - GST, ITR, Legal and Business Compliance Services",
  },
};

export default function HomePage() {
  return (
    <main className="home-page">
      <HeroSection />
      <WhyChooseUs />
      <ServicesOverview />
      <AboutCAFirm />
      <MyClients />
    </main>
  );
}
