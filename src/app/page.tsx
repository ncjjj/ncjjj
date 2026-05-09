import HeroSection from "../components/home/HeroSection";
import AboutCAFirm from "../components/home/AboutCAFirm";
import ServicesOverview from "../components/home/ServicesOverview";
import WhyChooseUs from "../components/home/WhyChooseUs";
import ProcessFlow from "../components/home/ProcessFlow";
import FileReturnCTA from "../components/home/FileReturnCTA";
import ScrollStack from "./ScrollStack";
import MyClients from "../components/home/MyClients";
export default function HomePage() {
  return (
    <main className="home-page">
      <ScrollStack />
      <HeroSection />
      <WhyChooseUs />
      <ServicesOverview />
      <ProcessFlow />
      <FileReturnCTA />
      <AboutCAFirm />
      <MyClients />
    </main>
  );
}
