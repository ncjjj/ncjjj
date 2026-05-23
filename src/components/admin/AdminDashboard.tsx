"use client";

import { useEffect, useState } from "react";

type ConsultationRequest = {
  id: string;
  serviceName: string;
  fullName: string;
  email: string;
  phone: string;
  firmName: string | null;
  address: string;
  note: string | null;
  status: "pending" | "seen" | "contacted";
  createdAt: string;
};

type ProfileRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  firmName: string | null;
  createdAt: string;
};

type DashboardPayload = {
  consultationRequests: ConsultationRequest[];
  profiles: ProfileRow[];
};

const STATUS_OPTIONS: ConsultationRequest["status"][] = ["pending", "seen", "contacted"];

export default function AdminDashboard() {
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);

    try {
      const [requestsResponse, profilesResponse] = await Promise.all([
        fetch("/api/admin/consultation-requests", { cache: "no-store" }),
        fetch("/api/admin/profiles", { cache: "no-store" }),
      ]);

      const requestsPayload = (await requestsResponse.json()) as Partial<DashboardPayload> & { message?: string };
      const profilesPayload = (await profilesResponse.json()) as Partial<DashboardPayload> & { message?: string };

      if (!requestsResponse.ok) {
        throw new Error(requestsPayload?.message || "Unable to load consultation requests.");
      }

      if (!profilesResponse.ok) {
        throw new Error(profilesPayload?.message || "Unable to load profiles.");
      }

      setConsultationRequests(requestsPayload.consultationRequests || []);
      setProfiles(profilesPayload.profiles || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (requestId: string, status: ConsultationRequest["status"]) => {
    setMessage("");

    const response = await fetch(`/api/admin/consultation-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const payload = (await response.json().catch(() => null)) as {
      consultationRequest?: ConsultationRequest;
      message?: string;
    } | null;

    if (!response.ok || !payload?.consultationRequest) {
      setMessage(payload?.message || "Unable to update status.");
      return;
    }

    setConsultationRequests((current) =>
      current.map((item) => (item.id === requestId ? payload.consultationRequest! : item))
    );
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-[#fffaf0] px-3 py-5 text-[#3b2f1c] sm:px-4 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-8">
        <div className="flex flex-col gap-4 rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold sm:text-3xl">Admin Dashboard</h1>
            <p className="text-sm text-[#7a6a4f]">Consultation requests and registered profiles</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl bg-[#3b2f1c] px-4 py-3 text-sm font-semibold text-white sm:w-auto"
          >
            Logout
          </button>
        </div>

        {message ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p> : null}

        <section className="rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg sm:rounded-3xl sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold sm:text-2xl">Consultation Requests</h2>
            <button type="button" onClick={loadData} className="text-sm font-medium text-[#8a7340]">
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-[#7a6a4f]">Loading requests...</p>
          ) : consultationRequests.length === 0 ? (
            <p className="text-sm text-[#7a6a4f]">No consultation requests yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[980px] divide-y divide-[#eadfc7] text-sm">
                <thead>
                  <tr className="text-left text-[#8a7340]">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Firm</th>
                    <th className="py-3 pr-4">Service</th>
                    <th className="py-3 pr-4">Address</th>
                    <th className="py-3 pr-4">Note</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e6d3]">
                  {consultationRequests.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4 font-medium">{item.fullName}</td>
                      <td className="py-3 pr-4">{item.email}</td>
                      <td className="py-3 pr-4">{item.phone}</td>
                      <td className="py-3 pr-4">{item.firmName || "-"}</td>
                      <td className="py-3 pr-4">{item.serviceName}</td>
                      <td className="py-3 pr-4">{item.address}</td>
                      <td className="py-3 pr-4">{item.note || "-"}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={item.status}
                          onChange={(event) => updateStatus(item.id, event.target.value as ConsultationRequest["status"])}
                          className="rounded-lg border border-[#e5d7b6] bg-white px-3 py-2"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4">{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg sm:rounded-3xl sm:p-6">
          <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Registered Profiles</h2>

          {loading ? (
            <p className="text-sm text-[#7a6a4f]">Loading profiles...</p>
          ) : profiles.length === 0 ? (
            <p className="text-sm text-[#7a6a4f]">No profiles found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] divide-y divide-[#eadfc7] text-sm">
                <thead>
                  <tr className="text-left text-[#8a7340]">
                    <th className="py-3 pr-4">Full Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Firm</th>
                    <th className="py-3 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0e6d3]">
                  {profiles.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 pr-4 font-medium">{item.fullName}</td>
                      <td className="py-3 pr-4">{item.email}</td>
                      <td className="py-3 pr-4">{item.phone}</td>
                      <td className="py-3 pr-4">{item.firmName || "-"}</td>
                      <td className="py-3 pr-4">{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
