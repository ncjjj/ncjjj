"use client";

export default function UserRequestDashboard() {
  return (
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-6xl rounded-3xl border border-[#e8dcc0] bg-white/85 p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">My Service Requests</h2>
            <p className="text-sm text-[#7a6a4f]">Service request updates are available through manual review.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-[#d9c9a4] bg-[#fffaf0] p-8 text-center text-[#6b5b3e]">
          Socket-based live tracking has been removed. Please use the consultation forms and follow up through the dashboard for manual updates.
        </div>
      </div>
    </div>
  );
}
