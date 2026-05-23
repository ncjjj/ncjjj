import HeroSection from "../components/home/HeroSection";
import AboutCAFirm from "../components/home/AboutCAFirm";
import ServicesOverview from "../components/home/ServicesOverview";
import WhyChooseUs from "../components/home/WhyChooseUs";
// Removed ProcessFlow and FileReturnCTA as requested
import MyClients from "../components/home/MyClients";
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
