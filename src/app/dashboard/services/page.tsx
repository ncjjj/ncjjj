import Link from "next/link";
import { DASHBOARD_SERVICE_GROUPS } from "../../../lib/serviceAccess";

export default function ServicesLandingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e9dbc0] bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#2f2310]">Service Documents</h1>
        <p className="mt-1 text-sm text-[#7a6a4f]">Select a service section from sidebar, or use quick links below.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {DASHBOARD_SERVICE_GROUPS.map((group) => (
          <div key={group.key} className="rounded-2xl border border-[#e9dbc0] bg-white p-5 shadow-sm">
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
    </div>
  );
}
