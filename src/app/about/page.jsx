import FirmProfile from "../../components/about/FirmProfile";
import Credentials from "../../components/about/Credentials";
import ExperienceAndRegistrations from "../../components/about/ExperienceAndRegistrations";
import ClientEnquiryForm from "./components/ClientEnquiryForm";
import QuickConsultButton from "./components/QuickConsultButton";
import { getAboutPageData } from "./data";

export default async function AboutPage() {
  const aboutData = await getAboutPageData();

  return (
    <main>
      <section className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Why clients choose us</h2>
          <p className="mt-2 text-sm text-slate-600">
            {aboutData.activeClients}+ active clients served with {aboutData.yearsOfExperience}+ years of experience.
          </p>
        </div>
        <QuickConsultButton
          consultationPath={aboutData.consultationPath}
          firmName={aboutData.firmName}
        />
      </section>

      <FirmProfile />
      <Credentials />
      <ExperienceAndRegistrations />
      <ClientEnquiryForm supportEmail={aboutData.supportEmail} />
    </main>
  );
}
