"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import PasswordInput from "../common/PasswordInput";
import { ADMIN_SERVICE_OPTIONS } from "../../lib/serviceAccess";

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

type CreateUserFormState = {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  panCard: string;
  aadhaarCard: string;
  dob: string;
  gender: string;
  citizen: string;
  residentialStatus: string;
  firmName: string;
  serviceAccess: string[];
};

const STATUS_OPTIONS: ConsultationRequest["status"][] = ["pending", "seen", "contacted"];

const SIDEBAR_ITEMS: Array<{ href: string; label: string }> = [
  { href: "#add-user", label: "Add User" },
  { href: "#service-access", label: "Service Taken" },
  { href: "#consultation-requests", label: "Consultation Requests" },
  { href: "#registered-profiles", label: "Registered Profiles" },
];

function emptyUserForm(): CreateUserFormState {
  return {
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    panCard: "",
    aadhaarCard: "",
    dob: "",
    gender: "",
    citizen: "Indian",
    residentialStatus: "Resident",
    firmName: "",
    serviceAccess: ["income-tax", "gst", "tds"],
  };
}

export default function AdminDashboard() {
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success" | ""; text: string }>({ type: "", text: "" });
  const [userForm, setUserForm] = useState<CreateUserFormState>(emptyUserForm);
  const [creatingUser, setCreatingUser] = useState(false);
  const [aadhaarOtpCode, setAadhaarOtpCode] = useState("");
  const [aadhaarOtpVerified, setAadhaarOtpVerified] = useState(false);

  const [serviceEmail, setServiceEmail] = useState("");
  const [serviceAccess, setServiceAccess] = useState<string[]>([]);
  const [savingServiceAccess, setSavingServiceAccess] = useState(false);

  const [selectedUserForDocs, setSelectedUserForDocs] = useState<ProfileRow | null>(null);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [loadingUserDocs, setLoadingUserDocs] = useState(false);
  const [userDocsError, setUserDocsError] = useState("");

  const profileEmailOptions = useMemo(
    () => profiles.map((item) => ({ email: item.email, label: `${item.fullName} (${item.email})` })),
    [profiles]
  );

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
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to load admin data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewUserDocuments = async (user: ProfileRow) => {
    setSelectedUserForDocs(user);
    setLoadingUserDocs(true);
    setUserDocsError("");
    setUserDocuments([]);

    try {
      const response = await fetch(`/api/admin/documents?userId=${user.id}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to fetch user documents.");
      }

      setUserDocuments(payload.documents || []);
    } catch (err: any) {
      setUserDocsError(err.message || "Failed to load user documents.");
    } finally {
      setLoadingUserDocs(false);
    }
  };

  const getDocTypeLabel = (doc: any) => {
    if (doc.documentType.startsWith("service:")) {
      const serviceName = doc.documentType.replace("service:", "");
      return `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1).replace(/-/g, " ")} Service`;
    }
    if (doc.documentYear && doc.documentSlot) {
      const slotLabel = doc.documentSlot.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      return `Yearly (${doc.documentYear}) - ${slotLabel}`;
    }
    return doc.documentType;
  };

  const renderDocCard = (doc: any) => {
    return (
      <div key={doc.id} className="flex flex-col justify-between p-4 rounded-2xl border border-[#e8dcc0] bg-white shadow-sm hover:bg-[#faf6ed] transition space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white text-xs">
            📄
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-[#3b2f1c] truncate">{doc.fileName}</p>
            <p className="text-xs text-[#8a7340] font-medium">{getDocTypeLabel(doc)}</p>
            {doc.mimeType && <p className="text-[10px] text-gray-400 mt-0.5">{doc.mimeType}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#f3ebda]">
          <span className="text-[10px] text-[#7a6a4f]">
            Uploaded {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
          </span>
          {doc.signedUrl ? null : (
            <span className="text-xs text-red-500 font-medium">Link Unavailable</span>
          )}
        </div>
      </div>
    );
  };

  const updateStatus = async (requestId: string, status: ConsultationRequest["status"]) => {
    setMessage({ type: "", text: "" });

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
      setMessage({ type: "error", text: payload?.message || "Unable to update status." });
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

  const toggleService = (serviceValue: string, from: "userForm" | "serviceAccess") => {
    if (from === "userForm") {
      setUserForm((current) => ({
        ...current,
        serviceAccess: current.serviceAccess.includes(serviceValue)
          ? current.serviceAccess.filter((item) => item !== serviceValue)
          : [...current.serviceAccess, serviceValue],
      }));
      return;
    }

    setServiceAccess((current) =>
      current.includes(serviceValue)
        ? current.filter((item) => item !== serviceValue)
        : [...current, serviceValue]
    );
  };

  const handleVerifyOtp = () => {
    if (aadhaarOtpCode.trim().length < 4) {
      setMessage({ type: "error", text: "Enter Aadhaar OTP before verifying." });
      return;
    }

    setAadhaarOtpVerified(true);
    setMessage({ type: "success", text: "Aadhaar OTP verified for this add-user request." });
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!aadhaarOtpVerified) {
      setMessage({ type: "error", text: "Verify Aadhaar OTP before creating user credentials." });
      return;
    }

    setCreatingUser(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userForm,
          aadhaarOtpVerified: true,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        user?: { name?: string; email?: string };
      } | null;

      if (!response.ok) {
        setMessage({ type: "error", text: payload?.message || "Unable to create user credentials." });
        return;
      }

      setMessage({
        type: "success",
        text: `Created credentials for ${payload?.user?.name || userForm.name}.`,
      });
      setUserForm(emptyUserForm());
      setAadhaarOtpCode("");
      setAadhaarOtpVerified(false);
      await loadData();
    } catch {
      setMessage({ type: "error", text: "Unable to create user credentials right now." });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAssignServiceAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (!serviceEmail.trim()) {
      setMessage({ type: "error", text: "Select user email before saving service access." });
      return;
    }

    setSavingServiceAccess(true);

    try {
      const response = await fetch("/api/admin/users/service-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: serviceEmail,
          serviceAccess,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setMessage({ type: "error", text: payload?.message || "Unable to update service access." });
        return;
      }

      setMessage({ type: "success", text: "Service access updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Unable to update service access right now." });
    } finally {
      setSavingServiceAccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf0] px-3 py-5 text-[#3b2f1c] sm:px-4 sm:py-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <aside className="h-fit rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg lg:sticky lg:top-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7340]">Admin Sidebar</h2>
          <nav className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-[#4a3a22] hover:border-[#e8dcc0] hover:bg-[#fbf4e7]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-5 sm:space-y-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold sm:text-3xl">Admin Dashboard</h1>
              <p className="text-sm text-[#7a6a4f]">User onboarding, service assignment, consultation requests and profiles</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl bg-[#3b2f1c] px-4 py-3 text-sm font-semibold text-white sm:w-auto"
            >
              Logout
            </button>
          </div>

          {message.text ? (
            <p
              className={`rounded-xl p-4 text-sm ${
                message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </p>
          ) : null}

          <section id="add-user" className="rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex flex-col gap-2">
              <h2 className="text-xl font-semibold sm:text-2xl">Add User</h2>
              <p className="text-sm text-[#7a6a4f]">Admin creates login credentials and stores mandatory Aadhaar details.</p>
            </div>

            <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCreateUser}>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-name">Full Name</label>
                <input
                  id="admin-user-name"
                  value={userForm.name}
                  onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-email">Email ID</label>
                <input
                  id="admin-user-email"
                  type="email"
                  value={userForm.email}
                  onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-mobile">Phone Number</label>
                <input
                  id="admin-user-mobile"
                  type="tel"
                  value={userForm.mobileNumber}
                  onChange={(event) => setUserForm((current) => ({ ...current, mobileNumber: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-pan">PAN Card</label>
                <input
                  id="admin-user-pan"
                  value={userForm.panCard}
                  onChange={(event) => setUserForm((current) => ({ ...current, panCard: event.target.value.toUpperCase() }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-aadhaar">Aadhaar Card (Mandatory)</label>
                <input
                  id="admin-user-aadhaar"
                  value={userForm.aadhaarCard}
                  onChange={(event) => {
                    setAadhaarOtpVerified(false);
                    setUserForm((current) => ({ ...current, aadhaarCard: event.target.value }));
                  }}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-aadhaar-otp">Aadhaar OTP</label>
                <div className="flex gap-2">
                  <input
                    id="admin-user-aadhaar-otp"
                    value={aadhaarOtpCode}
                    onChange={(event) => {
                      setAadhaarOtpVerified(false);
                      setAadhaarOtpCode(event.target.value);
                    }}
                    className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="Enter OTP"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="rounded-xl border border-[#d9c69a] bg-[#fbf4e7] px-4 py-3 text-sm font-semibold text-[#5c4929]"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-xs text-[#7a6a4f]">{aadhaarOtpVerified ? "OTP verified" : "Verify OTP before create user."}</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-dob">DOB</label>
                <input
                  id="admin-user-dob"
                  type="date"
                  value={userForm.dob}
                  onChange={(event) => setUserForm((current) => ({ ...current, dob: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-gender">Gender</label>
                <select
                  id="admin-user-gender"
                  value={userForm.gender}
                  onChange={(event) => setUserForm((current) => ({ ...current, gender: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-citizen">Citizen</label>
                <input
                  id="admin-user-citizen"
                  value={userForm.citizen}
                  onChange={(event) => setUserForm((current) => ({ ...current, citizen: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-residential-status">Residential Status</label>
                <input
                  id="admin-user-residential-status"
                  value={userForm.residentialStatus}
                  onChange={(event) => setUserForm((current) => ({ ...current, residentialStatus: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-firm">Firm Name (Optional)</label>
                <input
                  id="admin-user-firm"
                  value={userForm.firmName}
                  onChange={(event) => setUserForm((current) => ({ ...current, firmName: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                />
              </div>

              <PasswordInput
                id="admin-user-password"
                label="Password"
                value={userForm.password}
                onChange={(value) => setUserForm((current) => ({ ...current, password: value }))}
                required
                autoComplete="new-password"
                className="grid gap-2"
                labelClassName="text-sm font-medium text-[#3b2f1c]"
                inputClassName="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 pr-20 outline-none focus:border-[#b89b5e]"
                buttonClassName="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e5d7b6] bg-white px-3 py-1 text-xs font-semibold text-[#6b5b3e] transition hover:bg-[#f6efdf]"
              />

              <PasswordInput
                id="admin-user-confirm-password"
                label="Confirm Password"
                value={userForm.confirmPassword}
                onChange={(value) => setUserForm((current) => ({ ...current, confirmPassword: value }))}
                required
                autoComplete="new-password"
                className="grid gap-2"
                labelClassName="text-sm font-medium text-[#3b2f1c]"
                inputClassName="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 pr-20 outline-none focus:border-[#b89b5e]"
                buttonClassName="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e5d7b6] bg-white px-3 py-1 text-xs font-semibold text-[#6b5b3e] transition hover:bg-[#f6efdf]"
              />

              <div className="lg:col-span-2 grid gap-3 rounded-xl border border-[#eadfc7] bg-[#fdf7eb] p-4">
                <p className="text-sm font-semibold text-[#4a3a22]">Service Taken (for sidebar visibility)</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {ADMIN_SERVICE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm text-[#4a3a22]">
                      <input
                        type="checkbox"
                        checked={userForm.serviceAccess.includes(option.value)}
                        onChange={() => toggleService(option.value, "userForm")}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#7a6a4f]">Password is hashed in database, and Aadhaar OTP verification flag is also stored.</p>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="rounded-xl bg-gradient-to-r from-[#6b5b3e] to-[#b89b5e] px-5 py-3 font-semibold text-white disabled:opacity-70"
                >
                  {creatingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </section>

          <section id="service-access" className="rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg sm:rounded-3xl sm:p-6">
            <h2 className="mb-3 text-xl font-semibold sm:text-2xl">Service Taken</h2>
            <p className="mb-4 text-sm text-[#7a6a4f]">After assigning services here, user dashboard sidebar will only show selected sections.</p>

            <form className="space-y-4" onSubmit={handleAssignServiceAccess}>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="service-access-email">Select User</label>
                <input
                  id="service-access-email"
                  list="admin-profile-emails"
                  value={serviceEmail}
                  onChange={(event) => setServiceEmail(event.target.value)}
                  className="w-full rounded-xl border border-[#e5d7b6] px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Type user email"
                  required
                />
                <datalist id="admin-profile-emails">
                  {profileEmailOptions.map((item) => (
                    <option key={item.email} value={item.email}>
                      {item.label}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ADMIN_SERVICE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-[#4a3a22]">
                    <input
                      type="checkbox"
                      checked={serviceAccess.includes(option.value)}
                      onChange={() => toggleService(option.value, "serviceAccess")}
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={savingServiceAccess}
                className="rounded-xl bg-[#5f4c2b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {savingServiceAccess ? "Saving..." : "Save Service Taken"}
              </button>
            </form>
          </section>

          <section id="consultation-requests" className="rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg sm:rounded-3xl sm:p-6">
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

          <section id="registered-profiles" className="rounded-2xl border border-[#e8dcc0] bg-white/90 p-4 shadow-lg sm:rounded-3xl sm:p-6">
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
                      <th className="py-3 pr-4">Actions</th>
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
                        <td className="py-3 pr-4">
                          <button
                            type="button"
                            onClick={() => handleViewUserDocuments(item)}
                            className="rounded-lg border border-[#d9c69a] bg-[#fbf4e7] px-3 py-1.5 text-xs font-semibold text-[#5c4929] hover:bg-[#f6efdf] transition"
                          >
                            View Docs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedUserForDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0e6d3] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#3b2f1c]">
                  Documents of {selectedUserForDocs.fullName}
                </h3>
                <p className="text-xs text-[#7a6a4f] mt-1">
                  {selectedUserForDocs.email} • {selectedUserForDocs.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForDocs(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#fbf4e7] hover:bg-[#f6efdf] text-lg font-bold text-[#5c4929] transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {loadingUserDocs ? (
              <p className="text-center text-sm text-[#7a6a4f] py-12">Loading user documents...</p>
            ) : userDocsError ? (
              <p className="text-center text-sm text-red-600 py-12">{userDocsError}</p>
            ) : userDocuments.length === 0 ? (
              <p className="text-center text-sm text-[#7a6a4f] py-12">No documents uploaded by this user yet.</p>
            ) : (
              <div className="space-y-8">
                {/* Personal & General Docs */}
                {(() => {
                  const personal = userDocuments.filter(d => !d.documentType.startsWith("service:") && !d.documentYear && !d.documentSlot);
                  if (personal.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8a7340] border-b border-[#f3ebda] pb-1">Personal & General Documents</h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {personal.map(doc => renderDocCard(doc))}
                      </div>
                    </div>
                  );
                })()}

                {/* Yearly Docs */}
                {(() => {
                  const yearly = userDocuments.filter(d => d.documentYear && d.documentSlot);
                  if (yearly.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8a7340] border-b border-[#f3ebda] pb-1">Yearly Documents</h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {yearly.map(doc => renderDocCard(doc))}
                      </div>
                    </div>
                  );
                })()}

                {/* Service Docs */}
                {(() => {
                  const service = userDocuments.filter(d => d.documentType.startsWith("service:"));
                  if (service.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8a7340] border-b border-[#f3ebda] pb-1">Service Documents</h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {service.map(doc => renderDocCard(doc))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
