"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import PasswordInput from "../common/PasswordInput";
import { ADMIN_SERVICE_OPTIONS } from "../../lib/serviceAccess";
import { formatFinancialYear } from "../../lib/yearlyDocumentTypes";

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
  userId?: string | null;
};

type DashboardPayload = {
  consultationRequests: ConsultationRequest[];
  profiles: ProfileRow[];
};

type CreateUserFormState = {
  name: string;
  email: string;
  otp: string;
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
  { href: "#overview", label: "Overview" },
  { href: "#add-user", label: "Add User" },
  { href: "#upload-past-year", label: "Upload Past Year Document" },
  { href: "#service-access", label: "Service Taken" },
  { href: "#consultation-requests", label: "Consultation Requests" },
  { href: "#registered-profiles", label: "Registered Profiles" },
];

function emptyUserForm(): CreateUserFormState {
  return {
    name: "",
    email: "",
    otp: "",
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
  const router = useRouter();
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success" | ""; text: string }>({ type: "", text: "" });
  const [userForm, setUserForm] = useState<CreateUserFormState>(emptyUserForm);
  const [creatingUser, setCreatingUser] = useState(false);
  const [serviceEmail, setServiceEmail] = useState("");
  const [serviceAccess, setServiceAccess] = useState<string[]>([]);
  const [savingServiceAccess, setSavingServiceAccess] = useState(false);

  const [pastYearFile, setPastYearFile] = useState<File | null>(null);
  const [pastYearYear, setPastYearYear] = useState("2025");
  const [pastYearSlot, setPastYearSlot] = useState("last_year_itr");

  type DueTaskItem = {
    id: string;
    type: "document" | "consultation";
    userId?: string | null;
    userName: string;
    userEmail: string;
    userPhone: string;
    serviceName: string;
    documentType?: string;
    documentYear?: number;
    financialYear?: string;
    fileName?: string;
    fileUrl?: string;
    note?: string;
    createdAt: string;
    status: string;
  };

  type DashboardStats = {
    totalRegisteredUsers: number;
    totalGstUsers: number;
    totalTdsUsers: number;
    totalIncomeTaxUsers: number;
    currentFinancialYear: string;
    incomeTaxPendency: {
      due: number;
      wip: number;
      complete: number;
    };
    totalDueTasks: number;
    totalWipTasks: number;
    totalCompleteTasks: number;
    dueTasksList: DueTaskItem[];
    wipTasksList: DueTaskItem[];
    completeTasksList: DueTaskItem[];
  };

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [viewingTasksType, setViewingTasksType] = useState<"due" | "wip" | "complete" | null>(null);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch("/api/admin/dashboard-stats", { cache: "no-store" });
      const payload = await response.json();
      if (response.ok) {
        setStats(payload);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const [otpSent, setOtpSent] = useState(false);
  const [otpSentEmail, setOtpSentEmail] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const handleSendOtp = async () => {
    setOtpError("");
    setMessage({ type: "", text: "" });

    const emailVal = userForm.email.trim();
    if (!emailVal) {
      setOtpError("Please enter a valid email address first.");
      return;
    }

    setSendingOtp(true);

    try {
      const response = await fetch("/api/admin/users/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailVal,
          mobileNumber: userForm.mobileNumber.trim(),
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setOtpError(payload?.message || "Failed to send verification OTP.");
        return;
      }

      setOtpSent(true);
      setOtpSentEmail(emailVal);
      setMessage({ type: "success", text: payload?.message || "Verification OTP has been sent successfully." });
    } catch {
      setOtpError("Unable to send verification OTP right now.");
    } finally {
      setSendingOtp(false);
    }
  };

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

  const selectedUserRef = useRef(selectedUserForDocs);
  useEffect(() => {
    selectedUserRef.current = selectedUserForDocs;
  }, [selectedUserForDocs]);

  useEffect(() => {
    loadData();
    loadStats();

    let socket: any = null;
    const connectSocket = async () => {
      try {
        await fetch("/api/socket", { cache: "no-store" });
        socket = io({
          path: "/socket.io",
          transports: ["websocket"],
          query: { isAdmin: "true" },
        });

        socket.on("connect", () => {
          console.log("Admin connected to socket.io.");
        });

        socket.on("admin-update", (payload: any) => {
          console.log("Admin received real-time update event:", payload);
          loadData();
          loadStats();
          if (selectedUserRef.current) {
            handleViewUserDocuments(selectedUserRef.current);
          }
        });
      } catch (err) {
        console.error("Failed to connect admin socket", err);
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
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
    if (!doc || !doc.documentType) {
      return "";
    }
    if (doc.documentType.startsWith("service:")) {
      const serviceName = doc.documentType.replace("service:", "");
      return `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1).replace(/-/g, " ")} Service`;
    }
    if (doc.documentYear && doc.documentSlot) {
      const slotLabel = doc.documentSlot.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      return `Yearly (${formatFinancialYear(doc.documentYear)}) - ${slotLabel}`;
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
          <div className="min-w-0 font-medium">
            <p className="font-semibold text-sm text-[#3b2f1c] truncate">{doc.fileName}</p>
            <p className="text-xs text-[#8a7340]">{getDocTypeLabel(doc)}</p>
            {doc.mimeType && <p className="text-[10px] text-gray-400 mt-0.5">{doc.mimeType}</p>}
            {doc.uploadStatus && (
              <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                doc.uploadStatus === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : doc.uploadStatus === "verified"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {doc.uploadStatus === "completed"
                  ? "Completed (ITR Filed)"
                  : doc.uploadStatus === "verified"
                  ? "Verified (WIP)"
                  : "Uploaded (Due)"}
              </span>
            )}
          </div>
        </div>

        {doc.documentType && doc.documentType.startsWith("service:") && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#f3ebda]">
            <span className="text-xs font-semibold text-[#5c4a2e]">Verify Status:</span>
            <select
              value={doc.uploadStatus || "uploaded"}
              onChange={async (e) => {
                const newStatus = e.target.value;
                try {
                  const response = await fetch("/api/admin/documents", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ documentId: doc.id, uploadStatus: newStatus }),
                  });
                  if (!response.ok) throw new Error("Failed to update status");
                  if (selectedUserForDocs) {
                    await handleViewUserDocuments(selectedUserForDocs);
                  }
                  await loadStats();
                } catch (err) {
                  alert("Failed to update status");
                }
              }}
              className="rounded-lg border border-[#e5d7b6] bg-white px-2 py-1 text-xs text-[#3b2f1c] font-medium outline-none focus:border-[#b89b5e]"
            >
              <option value="uploaded">Uploaded (Due)</option>
              <option value="verified">Verified (WIP)</option>
              <option value="completed">Completed (ITR Filed)</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#f3ebda]">
          <span className="text-[10px] text-[#7a6a4f]">
            Uploaded {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
          </span>
          {doc.signedUrl ? (
            <a
              href={doc.signedUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-[#f5e6c8] px-3 py-1.5 text-xs font-semibold text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
            >
              View Document
            </a>
          ) : (
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
    void loadStats();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
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



  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setOtpError("");

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
        user?: { id?: string; name?: string; email?: string };
      } | null;

      if (!response.ok || !payload?.user?.id) {
        setMessage({ type: "error", text: payload?.message || "Unable to create user credentials." });
        return;
      }

      const createdUserId = payload.user.id;

      // If a past year file is selected, upload it!
      if (pastYearFile) {
        const formData = new FormData();
        formData.append("file", pastYearFile);
        formData.append("userId", createdUserId);
        formData.append("year", pastYearYear);
        formData.append("documentSlot", pastYearSlot);

        const uploadRes = await fetch("/api/admin/uploads/past-year-document", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => null);
          console.warn("Past year document upload failed:", uploadErr);
          setMessage({
            type: "success",
            text: `Created credentials for ${payload.user.name || userForm.name}, but past year document upload failed: ${uploadErr?.message || "unknown error"}.`,
          });
          setUserForm(emptyUserForm());
          setOtpSent(false);
          setOtpSentEmail("");
          setOtpError("");
          setPastYearFile(null);
          await loadData();
          return;
        }
      }

      setMessage({
        type: "success",
        text: `Created credentials for ${payload?.user?.name || userForm.name}.${pastYearFile ? " Past year document uploaded successfully." : ""}`,
      });
      setUserForm(emptyUserForm());
      setOtpSent(false);
      setOtpSentEmail("");
      setOtpError("");
      setPastYearFile(null);
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
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-[#4a3a22] hover:border-[#e8dcc0] hover:bg-[#fbf4e7]"
              >
                {item.label}
              </Link>
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

          {/* Dashboard Stats & Pendency Section */}
          <section id="overview" className="space-y-6">
            {loadingStats ? (
              <div className="flex items-center justify-center p-8 rounded-2xl border border-[#e8dcc0] bg-white">
                <span className="text-sm text-[#7a6a4f] font-medium animate-pulse">Loading statistics...</span>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Row 1: Users Stats */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7340]">User Analytics</h3>
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    {/* Total Registered Users */}
                    <div className="group rounded-2xl border border-[#e8dcc0] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8a7340]">Registered Users</span>
                        <span className="text-2xl">👥</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-[#3b2f1c]">{stats.totalRegisteredUsers}</p>
                      <p className="mt-1 text-xs text-gray-500">Total system accounts</p>
                    </div>

                    {/* Total Income Tax Users */}
                    <div className="group rounded-2xl border border-[#e8dcc0] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8a7340]">Income Tax Users</span>
                        <span className="text-2xl">📄</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-[#3b2f1c]">{stats.totalIncomeTaxUsers}</p>
                      <p className="mt-1 text-xs text-gray-500">Access to Income Tax</p>
                    </div>

                    {/* Total GST Users */}
                    <div className="group rounded-2xl border border-[#e8dcc0] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8a7340]">GST Users</span>
                        <span className="text-2xl">🛍️</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-[#3b2f1c]">{stats.totalGstUsers}</p>
                      <p className="mt-1 text-xs text-gray-500">Access to GST</p>
                    </div>

                    {/* Total TDS Users */}
                    <div className="group rounded-2xl border border-[#e8dcc0] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8a7340]">TDS Users</span>
                        <span className="text-2xl">💼</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-[#3b2f1c]">{stats.totalTdsUsers}</p>
                      <p className="mt-1 text-xs text-gray-500">Access to TDS</p>
                    </div>
                  </div>
                </div>

                {/* Row 2: Income Tax Pendency */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7340]">
                      Income Tax Pendency
                    </h3>
                    <span className="text-xs font-medium text-[#7a6a4f] bg-[#fbf4e7] border border-[#e8dcc0] px-2.5 py-1 rounded-full">
                      FY {stats.currentFinancialYear}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Due Task Count (Red) */}
                    <div
                      onClick={() => setViewingTasksType("due")}
                      className="group cursor-pointer rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-red-800">Due Task Count</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-sm">⚠️</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-red-900">{stats.totalDueTasks}</p>
                      <p className="mt-1 text-xs text-red-700">Click to view all pending tasks and user uploads</p>
                    </div>

                    {/* Work In Progress (Blue) */}
                    <div
                      onClick={() => setViewingTasksType("wip")}
                      className="group cursor-pointer rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-blue-800">Work In Progress</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm">⚙️</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-blue-900">{stats.totalWipTasks}</p>
                      <p className="mt-1 text-xs text-blue-700">Click to view all verified tasks in progress</p>
                    </div>

                    {/* Complete (Green) */}
                    <div
                      onClick={() => setViewingTasksType("complete")}
                      className="group cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-800">Complete</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm">✓</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-emerald-900">{stats.totalCompleteTasks}</p>
                      <p className="mt-1 text-xs text-emerald-700">Click to view all completed and filed tasks</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

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
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Enter Full Name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-email">Email ID</label>
                <div className="flex gap-2">
                  <input
                    id="admin-user-email"
                    type="email"
                    value={userForm.email}
                    onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full flex-1 rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e] disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Enter Email ID"
                    required
                    disabled={otpSent}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !userForm.email}
                    className="rounded-xl bg-[#5f4c2b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4d3d22] transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                  {otpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpSentEmail("");
                        setUserForm((current) => ({ ...current, otp: "" }));
                      }}
                      className="rounded-xl bg-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300 transition"
                    >
                      Change
                    </button>
                  )}
                </div>
                {otpError && <p className="text-xs text-red-600 font-medium mt-1">{otpError}</p>}
                {otpSent && !otpError && (
                  <p className="text-xs text-emerald-600 font-medium mt-1">OTP sent to {otpSentEmail}.</p>
                )}
              </div>

              {otpSent && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-otp">Email OTP Code (6 digits)</label>
                  <input
                    id="admin-user-otp"
                    type="text"
                    pattern="\d{6}"
                    maxLength={6}
                    value={userForm.otp}
                    onChange={(event) => setUserForm((current) => ({ ...current, otp: event.target.value.replace(/\D/g, "") }))}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="Enter 6-digit OTP code"
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-mobile">Phone Number (Mandatory)</label>
                <input
                  id="admin-user-mobile"
                  type="tel"
                  value={userForm.mobileNumber}
                  onChange={(event) => {
                    setUserForm((current) => ({ ...current, mobileNumber: event.target.value }));
                  }}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Enter Phone Number"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-pan">PAN Card</label>
                <input
                  id="admin-user-pan"
                  value={userForm.panCard}
                  onChange={(event) => setUserForm((current) => ({ ...current, panCard: event.target.value.toUpperCase() }))}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Enter PAN Card (Optional)"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-aadhaar">Aadhaar Card (Mandatory)</label>
                <input
                  id="admin-user-aadhaar"
                  value={userForm.aadhaarCard}
                  onChange={(event) => {
                    setUserForm((current) => ({ ...current, aadhaarCard: event.target.value }));
                  }}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Enter Aadhaar Card Number"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-dob">DOB</label>
                <input
                  id="admin-user-dob"
                  type="date"
                  value={userForm.dob}
                  onChange={(event) => setUserForm((current) => ({ ...current, dob: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-gender">Gender</label>
                <select
                  id="admin-user-gender"
                  value={userForm.gender}
                  onChange={(event) => setUserForm((current) => ({ ...current, gender: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
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
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Enter Citizenship (e.g. Indian)"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-residential-status">Residential Status</label>
                <input
                  id="admin-user-residential-status"
                  value={userForm.residentialStatus}
                  onChange={(event) => setUserForm((current) => ({ ...current, residentialStatus: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Enter Residential Status"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="admin-user-firm">Firm Name (Optional)</label>
                <input
                  id="admin-user-firm"
                  value={userForm.firmName}
                  onChange={(event) => setUserForm((current) => ({ ...current, firmName: event.target.value }))}
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                  placeholder="Enter Firm Name (Optional)"
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
                inputClassName="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 pr-20 outline-none focus:border-[#b89b5e]"
                buttonClassName="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e5d7b6] bg-white px-3 py-1 text-xs font-semibold text-[#6b5b3e] transition hover:bg-[#f6efdf]"
                placeholder="Enter Password"
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
                inputClassName="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 pr-20 outline-none focus:border-[#b89b5e]"
                buttonClassName="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e5d7b6] bg-white px-3 py-1 text-xs font-semibold text-[#6b5b3e] transition hover:bg-[#f6efdf]"
                placeholder="Confirm Password"
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

              <div id="upload-past-year" className="lg:col-span-2 grid gap-3 rounded-xl border border-[#eadfc7] bg-[#fdf7eb] p-4">
                <p className="text-sm font-semibold text-[#4a3a22]">Upload Past Year Document (Optional)</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="past-year-year">Select Year</label>
                    <select
                      id="past-year-year"
                      value={pastYearYear}
                      onChange={(e) => setPastYearYear(e.target.value)}
                      className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    >
                      <option value="2023">2023- 2024</option>
                      <option value="2024">2024-2025</option>
                      <option value="2025">2025-2026</option>
                      <option value="2026">2026-2027</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="past-year-slot">Document Type</label>
                    <select
                      id="past-year-slot"
                      value={pastYearSlot}
                      onChange={(e) => setPastYearSlot(e.target.value)}
                      className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    >
                      <option value="last_year_itr">Last year ITR</option>
                      <option value="last_year_computation">Last Year Computation</option>
                      <option value="last_year_bs">Last Year B/S</option>
                      <option value="last_year_pl">Last year P/L</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-[#3b2f1c]" htmlFor="past-year-file">File (PDF/Image)</label>
                    <input
                      id="past-year-file"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setPastYearFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-2.5 outline-none focus:border-[#b89b5e]"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#7a6a4f]">
                  {!otpSent ? "Verify email to enable creation." : "Password is hashed in database."}
                </p>
                <button
                  type="submit"
                  disabled={creatingUser || !otpSent || !userForm.otp || userForm.email.trim().toLowerCase() !== otpSentEmail.trim().toLowerCase()}
                  className="rounded-xl bg-gradient-to-r from-[#6b5b3e] to-[#b89b5e] px-5 py-3 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
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
                          {item.userId ? (
                            <button
                              type="button"
                              onClick={() => {
                                handleViewUserDocuments({
                                  ...item,
                                  id: item.userId!,
                                });
                              }}
                              className="rounded-lg bg-[#f5e6c8] px-3 py-1.5 text-xs font-semibold text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
                            >
                              View Documents
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not Registered</span>
                          )}
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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
      {viewingTasksType && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0e6d3] pb-4">
              <div>
                <h3 className="text-2xl font-bold text-[#3b2f1c] flex items-center gap-2">
                  <span>
                    {viewingTasksType === "due" && "⚠️"}
                    {viewingTasksType === "wip" && "⚙️"}
                    {viewingTasksType === "complete" && "✓"}
                  </span>{" "}
                  {viewingTasksType === "due" && `Active Due Tasks (${stats.totalDueTasks})`}
                  {viewingTasksType === "wip" && `Work In Progress Tasks (${stats.totalWipTasks})`}
                  {viewingTasksType === "complete" && `Completed Tasks (${stats.totalCompleteTasks})`}
                </h3>
                <p className="text-xs text-[#7a6a4f] mt-1">
                  {viewingTasksType === "due" && "List of all pending service requests and files uploaded by users that require attention."}
                  {viewingTasksType === "wip" && "List of all verified tasks that are currently being processed."}
                  {viewingTasksType === "complete" && "List of all service tasks and return filings that are complete."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingTasksType(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#fbf4e7] hover:bg-[#f6efdf] text-lg font-bold text-[#5c4929] transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {(viewingTasksType === "due" ? stats.dueTasksList : viewingTasksType === "wip" ? stats.wipTasksList : stats.completeTasksList).length === 0 ? (
              <p className="text-center text-sm text-[#7a6a4f] py-12">No tasks in this category at the moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#eadfc7] text-sm">
                  <thead>
                    <tr className="text-left text-[#8a7340]">
                      <th className="py-3 px-4 font-semibold">User Details</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold">Service Name</th>
                      <th className="py-3 px-4 font-semibold">Details</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Action / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e6d3] text-[#3b2f1c]">
                    {(viewingTasksType === "due" ? stats.dueTasksList : viewingTasksType === "wip" ? stats.wipTasksList : stats.completeTasksList).map((task) => (
                      <tr key={task.id} className="hover:bg-[#fffdf8] transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-sm">{task.userName}</p>
                          <p className="text-xs text-gray-500">{task.userEmail}</p>
                          <p className="text-xs text-gray-500">{task.userPhone || "-"}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.type === "document"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {task.type === "document" ? "File Upload" : "Service Taken"}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium">
                          {task.type === "document"
                            ? getDocTypeLabel({ documentType: task.documentType, documentSlot: task.financialYear, documentYear: task.documentYear })
                            : task.serviceName}
                        </td>
                        <td className="py-4 px-4 max-w-[200px] truncate">
                          {task.type === "document" ? (
                            <div>
                              <p className="text-xs font-semibold text-gray-600">File:</p>
                              <p className="text-xs break-all" title={task.fileName}>{task.fileName}</p>
                              {task.financialYear && (
                                <p className="text-[10px] text-amber-800 font-semibold bg-amber-50 rounded px-1.5 py-0.5 inline-block mt-1">
                                  FY {task.financialYear}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p className="text-xs font-semibold text-gray-600">Note:</p>
                              <p className="text-xs whitespace-pre-wrap line-clamp-2" title={task.note || ""}>
                                {task.note || "-"}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500">
                          {new Date(task.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-4">
                          {task.type === "document" ? (
                            <div className="flex flex-col gap-2">
                              {task.userId ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleViewUserDocuments({
                                      id: task.userId!,
                                      fullName: task.userName,
                                      email: task.userEmail,
                                      phone: task.userPhone,
                                      firmName: null,
                                      createdAt: "",
                                    });
                                  }}
                                  className="text-center rounded-lg bg-[#f5e6c8] px-2 py-1 text-xs font-semibold text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
                                >
                                  View Documents
                                </button>
                              ) : task.fileUrl ? (
                                <a
                                  href={task.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-center rounded-lg bg-[#f5e6c8] px-2 py-1 text-xs font-semibold text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
                                >
                                  View File
                                </a>
                              ) : null}
                              <select
                                value={task.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  try {
                                    const response = await fetch("/api/admin/documents", {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ documentId: task.id, uploadStatus: newStatus }),
                                    });
                                    if (!response.ok) throw new Error("Failed to update status");
                                    await loadStats();
                                  } catch (err) {
                                    alert("Failed to update status");
                                  }
                                }}
                                className="rounded-lg border border-[#e5d7b6] bg-white px-2 py-1 text-xs outline-none focus:border-[#b89b5e]"
                              >
                                <option value="uploaded">Uploaded (Due)</option>
                                <option value="verified">Verified (WIP)</option>
                                <option value="completed">Completed (ITR Filed)</option>
                              </select>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              {task.userId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleViewUserDocuments({
                                      id: task.userId!,
                                      fullName: task.userName,
                                      email: task.userEmail,
                                      phone: task.userPhone,
                                      firmName: null,
                                      createdAt: "",
                                    });
                                  }}
                                  className="text-center rounded-lg bg-[#f5e6c8] px-2 py-1 text-xs font-semibold text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
                                >
                                  View Documents
                                </button>
                              )}
                              <select
                                value={task.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as ConsultationRequest["status"];
                                  try {
                                    await updateStatus(task.id, newStatus);
                                    await loadStats();
                                  } catch (err) {
                                    alert("Failed to update status");
                                  }
                                }}
                                className="rounded-lg border border-[#e5d7b6] bg-white px-2 py-1 text-xs outline-none focus:border-[#b89b5e]"
                              >
                                <option value="pending">Pending</option>
                                <option value="seen">Seen</option>
                                <option value="contacted">Completed</option>
                              </select>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
