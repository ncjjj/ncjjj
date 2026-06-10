import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { findUserById } from "../../../db/queries/users";
import { decodeServiceAccess, getDashboardGroupsForAccess } from "../../../lib/serviceAccess";
import MyServicesSection from "../../../components/dashboard/MyServicesSection";

export default async function ServicesLandingPage() {
  const session = await getServerSession(authOptions);
  let user = null;

  if (session?.user?.id) {
    try {
      user = await findUserById(session.user.id);
    } catch (error) {
      console.error("[dashboard/services] failed to load user", error);
    }
  }

  const serviceGroups = user ? getDashboardGroupsForAccess(decodeServiceAccess(user.serviceAccess)) : [];

  return (
    <div className="space-y-6">
      <MyServicesSection />

      <div className="rounded-2xl border border-[#e9dbc0] bg-white p-4 shadow-sm sm:p-5">
        <h1 className="text-xl font-semibold text-[#2f2310] sm:text-2xl">Service Documents</h1>
        <p className="mt-1 text-sm text-[#7a6a4f]">Select a service section from sidebar, or use quick links below.</p>
      </div>

      {serviceGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d9c69a] bg-[#fdf7eb] p-4 text-sm text-[#7a6a4f] sm:p-5">
          No service sections are assigned yet. Admin will enable service document uploads after onboarding.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {serviceGroups.map((group) => (
            <div key={group.key} className="rounded-2xl border border-[#e9dbc0] bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold text-[#2f2310]">{group.label}</h2>
              <div className="mt-3 grid gap-2">
                {group.sections.map((section) => (
                  <Link
                    key={section.key}
                    href={`/dashboard/services/${group.key}/${section.key}`}
                    className="rounded-xl border border-[#e3d2ae] bg-[#fbf4e7] px-4 py-2 text-sm font-medium text-[#4a3a22] hover:bg-[#f7edd8]"
                  >
                    {section.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
