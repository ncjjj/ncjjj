import FirmProfile from "../../components/about/FirmProfile";
import Credentials from "../../components/about/Credentials";
import ExperienceAndRegistrations from "../../components/about/ExperienceAndRegistrations";
import { getAboutPageData } from "./data";

export default async function AboutPage() {
  const aboutData = await getAboutPageData();

  return (
    <main>
      <section className="mb-8 rounded-lg border border-slate-200 p-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Why clients choose us</h2>
          <p className="mt-2 text-sm text-slate-600">
            {aboutData.activeClients}+ active clients served with {aboutData.yearsOfExperience}+ years of experience.
          </p>
        </div>
      </section>

      <FirmProfile />
      <Credentials />
      <ExperienceAndRegistrations />
    </main>
  );
}
