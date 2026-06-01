import FirmProfile from "../../components/about/FirmProfile";
import Credentials from "../../components/about/Credentials";
import ExperienceAndRegistrations from "../../components/about/ExperienceAndRegistrations";
import { getAboutPageData } from "./data";
import { createPageMetadata } from "../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "About NCJ Legal LLP",
  description:
    "Learn about NCJ Legal LLP, a professional services firm supporting clients with tax filing, GST, accounting, legal documentation and business compliance.",
  path: "/about",
  keywords: [
    "about NCJ Legal LLP",
    "tax consultant firm",
    "legal compliance firm",
    "GST consultant",
    "business advisory India",
  ],
});

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
