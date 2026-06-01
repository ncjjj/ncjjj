"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import PasswordInput from "../common/PasswordInput";
import { ADMIN_SERVICE_OPTIONS, decodeServiceAccess } from "../../lib/serviceAccess";
import {
  formatFinancialYear,
  getYearlyDocumentLabel,
  type YearlyDocumentSlot,
} from "../../lib/yearlyDocumentTypes";

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
  serviceAccess?: string | null;
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

type YearlyUploadCardKey = "itr" | "computation" | "pl" | "bs";

type YearlyUploadDraft = {
  slot: YearlyDocumentSlot;
  year: string;
  file: File | null;
};

type QueuedYearlyUpload = YearlyUploadDraft & {
  key: YearlyUploadCardKey;
  file: File;
};

const YEARLY_UPLOAD_CARD_DEFAULTS: Record<YearlyUploadCardKey, YearlyUploadDraft> = {
  itr: {
    slot: "last_year_itr",
    year: "2025",
    file: null,
  },
  computation: {
    slot: "last_year_computation",
    year: "2025",
    file: null,
  },
  pl: {
    slot: "last_year_pl",
    year: "2025",
    file: null,
  },
  bs: {
    slot: "last_year_bs",
    year: "2025",
    file: null,
  },
};

const YEARLY_UPLOAD_CARD_META: Array<{
  key: YearlyUploadCardKey;
  title: string;
  description: string;
  slotOptions?: YearlyDocumentSlot[];
}> = [
  {
    key: "itr",
    title: "Last Year ITR",
    description: "Upload the latest ITR for the user.",
  },
  {
    key: "computation",
    title: "Last Year Computation",
    description: "Upload the computation sheet for the user.",
  },
  {
    key: "pl",
    title: "Profit & Loss (P/L)",
    description: "Upload the Profit & Loss statement.",
  },
  {
    key: "bs",
    title: "Balance Sheet (B/S)",
    description: "Upload the Balance Sheet.",
  },
];

type AdminYearlyDocumentRow = {
  id: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  userPhone?: string | null;
  documentType: string;
  documentYear: number | null;
  documentSlot: string | null;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType: string | null;
  uploadStatus: string;
  signedUrl: string | null;
  createdAt: string;
};

const STATUS_OPTIONS: ConsultationRequest["status"][] = ["pending", "seen", "contacted"];

const SIDEBAR_ITEMS: Array<{ href: string; label: string }> = [
  { href: "#overview", label: "Overview" },
  { href: "#add-user", label: "Add User / Onboarding" },
  { href: "#service-access", label: "Service Taken" },
  { href: "#consultation-requests", label: "Consultation Requests" },
  { href: "#registered-profiles", label: "Registered Profiles" },
  { href: "#past-year-uploads", label: "Past Year Uploads" },
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

function createYearlyUploadDraft(slot: YearlyDocumentSlot, year = "2025"): YearlyUploadDraft {
  return {
    slot,
    year,
    file: null,
  };
}

function formatDisplayDate(value: string | Date | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatDobInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
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

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [modalServiceAccess, setModalServiceAccess] = useState<string[]>([]);
  const [savingModalServiceAccess, setSavingModalServiceAccess] = useState(false);

  const [yearlyUploadDrafts, setYearlyUploadDrafts] = useState<Record<YearlyUploadCardKey, YearlyUploadDraft>>(
    YEARLY_UPLOAD_CARD_DEFAULTS
  );
  const [queuedYearlyUploads, setQueuedYearlyUploads] = useState<QueuedYearlyUpload[]>([]);
  const [yearlyDocuments, setYearlyDocuments] = useState<AdminYearlyDocumentRow[]>([]);
  const [loadingYearlyDocuments, setLoadingYearlyDocuments] = useState(false);
  const [yearlyDocumentsError, setYearlyDocumentsError] = useState("");
  const [activeYearAccordion, setActiveYearAccordion] = useState<string | null>("2025");

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
      if (!response.ok) {
        throw new Error(`Failed to load stats: ${response.status} ${response.statusText}`);
      }
      const payload = await response.json().catch(() => null);
      if (payload) {
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
  const yearlyUploadInputRefs = useRef<Record<YearlyUploadCardKey, HTMLInputElement | null>>({
    itr: null,
    computation: null,
    pl: null,
    bs: null,
  });

  const profileEmailOptions = useMemo(
    () => profiles.map((item) => ({ email: item.email, label: `${item.fullName} (${item.email})` })),
    [profiles]
  );

  const groupedYearlyDocs = useMemo(() => {
    const groups: Record<
      string,
      Record<
        string,
        {
          userName: string;
          userEmail: string;
          userPhone: string;
          docs: Record<YearlyUploadCardKey, AdminYearlyDocumentRow | null>;
        }
      >
    > = {};

    yearlyDocuments.forEach((doc) => {
      if (!doc.documentYear || !doc.documentSlot) return;
      const yearKey = String(doc.documentYear);
      const userId = doc.userId;

      if (!groups[yearKey]) {
        groups[yearKey] = {};
      }

      if (!groups[yearKey][userId]) {
        groups[yearKey][userId] = {
          userName: doc.userName || "Unknown User",
          userEmail: doc.userEmail || "",
          userPhone: doc.userPhone || "",
          docs: {
            itr: null,
            computation: null,
            pl: null,
            bs: null,
          },
        };
      }

      let cardKey: YearlyUploadCardKey | null = null;
      if (doc.documentSlot === "last_year_itr") cardKey = "itr";
      else if (doc.documentSlot === "last_year_computation") cardKey = "computation";
      else if (doc.documentSlot === "last_year_pl") cardKey = "pl";
      else if (doc.documentSlot === "last_year_bs") cardKey = "bs";

      if (cardKey) {
        groups[yearKey][userId].docs[cardKey] = doc;
      }
    });

    return groups;
  }, [yearlyDocuments]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [requestsResponse, profilesResponse] = await Promise.all([
        fetch("/api/admin/consultation-requests", { cache: "no-store" }),
        fetch("/api/admin/profiles", { cache: "no-store" }),
      ]);

      if (!requestsResponse.ok) {
        throw new Error(`Failed to load consultation requests: ${requestsResponse.status} ${requestsResponse.statusText}`);
      }
      if (!profilesResponse.ok) {
        throw new Error(`Failed to load profiles: ${profilesResponse.status} ${profilesResponse.statusText}`);
      }

      const requestsPayload = await requestsResponse.json().catch(() => ({}));
      const profilesPayload = await profilesResponse.json().catch(() => ({}));

      setConsultationRequests(requestsPayload.consultationRequests || []);
      setProfiles(profilesPayload.profiles || []);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to load admin data." });
    } finally {
      setLoading(false);
    }
  };

  const loadYearlyDocuments = async () => {
    setLoadingYearlyDocuments(true);
    setYearlyDocumentsError("");

    try {
      const response = await fetch("/api/admin/documents?category=yearly", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { documents?: AdminYearlyDocumentRow[]; message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load yearly documents.");
      }

      setYearlyDocuments(payload?.documents || []);
    } catch (error) {
      setYearlyDocumentsError(error instanceof Error ? error.message : "Unable to load yearly documents.");
    } finally {
      setLoadingYearlyDocuments(false);
    }
  };

  const selectedUserRef = useRef(selectedUserForDocs);
  useEffect(() => {
    selectedUserRef.current = selectedUserForDocs;
  }, [selectedUserForDocs]);

  useEffect(() => {
    loadData();
    loadYearlyDocuments();
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
          loadYearlyDocuments();
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
      const targetUserId = user.userId || user.id;
      const response = await fetch(`/api/admin/documents?userId=${targetUserId}`);
      if (!response.ok) {
        throw new Error(`Failed to load documents: ${response.status} ${response.statusText}`);
      }
      const payload = await response.json().catch(() => ({}));
      setUserDocuments(payload.documents || []);
    } catch (err: any) {
      setUserDocsError(err.message || "Failed to load user documents.");
    } finally {
      setLoadingUserDocs(false);
    }
  };

  const handleViewUserFromTask = (userId: string, userName: string, userEmail: string, userPhone: string) => {
    const existingProfile = profiles.find(
      (p) =>
        (p.email && p.email.toLowerCase() === userEmail.toLowerCase()) ||
        (p.userId && p.userId === userId)
    );
    if (existingProfile) {
      handleViewUserDocuments(existingProfile);
      setModalServiceAccess(decodeServiceAccess(existingProfile.serviceAccess));
    } else {
      handleViewUserDocuments({
        id: userId,
        fullName: userName,
        email: userEmail,
        phone: userPhone,
        firmName: null,
        createdAt: "",
        userId: userId,
        serviceAccess: null,
      });
      setModalServiceAccess([]);
    }
  };

  const handleSaveModalServiceAccess = async () => {
    if (!selectedUserForDocs) return;
    setSavingModalServiceAccess(true);
    try {
      const response = await fetch("/api/admin/users/service-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUserForDocs.email,
          serviceAccess: modalServiceAccess,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to update service access.");
      }

      // Update local profiles list
      setProfiles((current) =>
        current.map((item) =>
          item.id === selectedUserForDocs.id
            ? { ...item, serviceAccess: modalServiceAccess.join(",") }
            : item
        )
      );

      // Update selected profile view
      setSelectedUserForDocs((current) =>
        current ? { ...current, serviceAccess: modalServiceAccess.join(",") } : null
      );

      alert("Services updated successfully.");
    } catch (err: any) {
      alert(err.message || "Failed to update services.");
    } finally {
      setSavingModalServiceAccess(false);
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
    const isYearly = !!(doc.documentYear && doc.documentSlot);

    return (
      <div key={doc.id} className="flex flex-col justify-between p-4 rounded-2xl border border-[#e8dcc0] bg-white shadow-sm hover:bg-[#faf6ed] hover:shadow transition duration-200 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white text-xs">
            📄
          </div>
          <div className="min-w-0 font-medium flex-1">
            <p className="font-semibold text-sm text-[#3b2f1c] truncate" title={doc.fileName}>{doc.fileName}</p>
            <p className="text-xs text-[#8a7340] mt-0.5">{getDocTypeLabel(doc)}</p>
            {doc.mimeType && <p className="text-[10px] text-gray-400 mt-0.5">{doc.mimeType}</p>}
            {doc.uploadStatus && !isYearly && (
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

        {!isYearly && (
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
            Uploaded {formatDisplayDate(doc.createdAt)}
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

  const renderYearlyUploadCard = (doc: AdminYearlyDocumentRow) => {
    return (
      <div key={doc.id} className="flex flex-col justify-between rounded-2xl border border-[#e8dcc0] bg-white p-4 shadow-sm transition hover:bg-[#faf6ed] hover:shadow space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-xs text-white">
            📄
          </div>
          <div className="min-w-0 font-medium flex-1">
            <p className="truncate text-sm font-semibold text-[#3b2f1c]" title={doc.fileName}>{doc.fileName}</p>
            <p className="text-xs text-[#8a7340] mt-0.5">{getDocTypeLabel(doc)}</p>
            <p className="text-[10px] text-gray-500 mt-1">
              {doc.userName || "Unknown user"} {doc.userEmail ? `• ${doc.userEmail}` : ""}
            </p>
            {doc.userPhone ? <p className="text-[10px] text-gray-400 mt-0.5">{doc.userPhone}</p> : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#f3ebda] pt-2">
          <span className="text-[10px] text-[#7a6a4f]">Uploaded {formatDisplayDate(doc.createdAt)}</span>
          {doc.signedUrl ? (
            <a
              href={doc.signedUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-[#f5e6c8] px-3 py-1.5 text-xs font-semibold text-[#6b5b3e] transition hover:bg-[#e8dcc0]"
            >
              View Document
            </a>
          ) : (
            <span className="text-xs font-medium text-red-500">Link Unavailable</span>
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

    const updateYearlyUploadDraft = (key: YearlyUploadCardKey, updater: (current: YearlyUploadDraft) => YearlyUploadDraft) => {
      setYearlyUploadDrafts((current) => ({
        ...current,
        [key]: updater(current[key]),
      }));
    };

    const queueYearlyUpload = (key: YearlyUploadCardKey) => {
      const draft = yearlyUploadDrafts[key];
      const file = draft.file;

      if (!file) {
        setMessage({ type: "error", text: "Choose a file before adding this past year upload." });
        return;
      }

      if (!draft.year.trim()) {
        setMessage({ type: "error", text: "Select a year before adding this past year upload." });
        return;
      }

      setQueuedYearlyUploads((current) => {
        const next = current.filter((item) => item.key !== key);
        return [...next, { key, slot: draft.slot, year: draft.year.trim(), file }];
      });

      updateYearlyUploadDraft(key, (current) => createYearlyUploadDraft(current.slot, current.year));

      const input = yearlyUploadInputRefs.current[key];
      if (input) {
        input.value = "";
      }

      setMessage({ type: "success", text: `${getYearlyDocumentLabel(draft.slot)} added to the upload queue.` });
    };

    const clearYearlyUploadQueue = () => {
      setQueuedYearlyUploads([]);
      setYearlyUploadDrafts(YEARLY_UPLOAD_CARD_DEFAULTS);

      Object.values(yearlyUploadInputRefs.current).forEach((input) => {
        if (input) {
          input.value = "";
        }
      });
    };

    const uploadQueuedYearlyDocuments = async (userId: string, userName: string) => {
      for (const upload of queuedYearlyUploads) {
        const formData = new FormData();
        formData.append("file", upload.file);
        formData.append("userId", userId);
        formData.append("year", upload.year);
        formData.append("documentSlot", upload.slot);

        const uploadRes = await fetch("/api/admin/uploads/past-year-document", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => null);
          throw new Error(
            `${getYearlyDocumentLabel(upload.slot)} upload failed: ${uploadErr?.message || "unknown error"}`
          );
        }
      }

      setMessage({
        type: "success",
        text: `Created credentials for ${userName}. All queued past year documents were uploaded successfully.`,
      });
    };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setOtpError("");

      if (queuedYearlyUploads.length !== YEARLY_UPLOAD_CARD_META.length) {
        setMessage({
          type: "error",
          text: "Add all 4 past year upload boxes before creating the user.",
        });
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
        user?: { id?: string; name?: string; email?: string };
      } | null;

      if (!response.ok || !payload?.user?.id) {
        setMessage({ type: "error", text: payload?.message || "Unable to create user credentials." });
        return;
      }

      const createdUserId = payload.user.id;

      try {
        await uploadQueuedYearlyDocuments(createdUserId, payload.user.name || userForm.name);
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "One or more past year uploads failed.",
        });
        await loadData();
        await loadYearlyDocuments();
        return;
      }

      setUserForm(emptyUserForm());
      setOtpSent(false);
      setOtpSentEmail("");
      setOtpError("");
      clearYearlyUploadQueue();
      await loadData();
      await loadStats();
      await loadYearlyDocuments();
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
    <div className="min-h-screen bg-[#fffcf5] px-3 py-5 text-[#3b2f1c] sm:px-4 sm:py-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        {/* Modern Sidebar Selector */}
        <aside className="h-fit rounded-3xl border border-[#e8dcc0]/80 bg-white/75 p-5 shadow-xl lg:sticky lg:top-4 backdrop-blur-md">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-[#8a7340] px-1">NCJ Control</h2>
          <nav className="space-y-1.5">
            {SIDEBAR_ITEMS.map((item) => {
              const tabId = item.href.slice(1);
              const isSelected = activeTab === tabId;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setActiveTab(tabId)}
                  className={`w-full text-left block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 border ${
                    isSelected
                      ? "border-[#b89b5e]/70 bg-gradient-to-r from-[#faf5e9] to-white text-[#5c4a2e] shadow-sm font-semibold"
                      : "border-transparent text-[#6b5b3e] hover:bg-[#fcfaf5] hover:text-[#5c4a2e]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dashboard Tabs Main Container */}
        <div className="space-y-6">
          {/* Glassmorphism Header */}
          <div className="flex flex-col gap-4 rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-[#3b2f1c] sm:text-3xl tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-[#7a6a4f] mt-1 text-justify">User onboarding, service assignment, consultation requests, and profiles</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl bg-gradient-to-r from-[#3b2f1c] to-[#5c4c2f] hover:from-[#2c2214] hover:to-[#4a3d24] px-5 py-3 text-sm font-semibold text-white sm:w-auto shadow-md transition duration-150"
            >
              Logout
            </button>
          </div>

          {message.text ? (
            <p
              className={`rounded-xl p-4 text-sm font-semibold shadow-sm ${
                message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </p>
          ) : null}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <section id="overview" className="space-y-6 animate-fade-in">
              {loadingStats ? (
                <div className="flex items-center justify-center p-12 rounded-3xl border border-[#e8dcc0] bg-white shadow-sm">
                  <span className="text-sm text-[#7a6a4f] font-medium animate-pulse">Loading statistics...</span>
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  {/* Row 1: Users Stats */}
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#8a7340]">User Analytics</h3>
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                      {/* Total Registered Users */}
                      <div className="group rounded-3xl border border-[#e8dcc0] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8a7340]">Registered Users</span>
                          <span className="text-2xl">👥</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-[#3b2f1c]">{stats.totalRegisteredUsers}</p>
                        <p className="mt-1 text-xs text-gray-500">Total system accounts</p>
                      </div>

                      {/* Total Income Tax Users */}
                      <div className="group rounded-3xl border border-[#e8dcc0] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8a7340]">Income Tax Users</span>
                          <span className="text-2xl">📄</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-[#3b2f1c]">{stats.totalIncomeTaxUsers}</p>
                        <p className="mt-1 text-xs text-gray-500">Access to Income Tax</p>
                      </div>

                      {/* Total GST Users */}
                      <div className="group rounded-3xl border border-[#e8dcc0] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8a7340]">GST Users</span>
                          <span className="text-2xl">🛍️</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-[#3b2f1c]">{stats.totalGstUsers}</p>
                        <p className="mt-1 text-xs text-gray-500">Access to GST</p>
                      </div>

                      {/* Total TDS Users */}
                      <div className="group rounded-3xl border border-[#e8dcc0] bg-white p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#8a7340]">TDS Users</span>
                          <span className="text-2xl">💼</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-[#3b2f1c]">{stats.totalTdsUsers}</p>
                        <p className="mt-1 text-xs text-gray-500">Access to TDS</p>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Income Tax Pendency */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8a7340]">
                        Income Tax Pendency
                      </h3>
                      <span className="text-xs font-semibold text-[#7a6a4f] bg-[#fbf4e7] border border-[#e8dcc0] px-3 py-1 rounded-full">
                        FY {stats.currentFinancialYear}
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Due Task Count (Red) */}
                      <div
                        onClick={() => setViewingTasksType("due")}
                        className="group cursor-pointer rounded-3xl border border-red-200 bg-red-50/40 p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-[0.1em] text-red-800">Due Task Count</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-sm">⚠️</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-red-900">{stats.totalDueTasks}</p>
                        <p className="mt-1 text-xs text-red-700">Click to view all pending tasks and user uploads</p>
                      </div>

                      {/* Work In Progress (Blue) */}
                      <div
                        onClick={() => setViewingTasksType("wip")}
                        className="group cursor-pointer rounded-3xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-[0.1em] text-blue-800">Work In Progress</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm">⚙️</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-blue-900">{stats.totalWipTasks}</p>
                        <p className="mt-1 text-xs text-blue-700">Click to view all verified tasks in progress</p>
                      </div>

                      {/* Complete (Green) */}
                      <div
                        onClick={() => setViewingTasksType("complete")}
                        className="group cursor-pointer rounded-3xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm hover:shadow-md hover:scale-[1.01] transition duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-800">Complete</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm">✓</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-emerald-900">{stats.totalCompleteTasks}</p>
                        <p className="mt-1 text-xs text-emerald-700">Click to view all completed and filed tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {/* TAB 2: ADD USER ONBOARDING */}
          {activeTab === "add-user" && (
            <section id="add-user" className="rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-xl space-y-6 animate-fade-in">
              <div className="mb-2">
                <h2 className="text-xl font-bold text-[#3b2f1c] sm:text-2xl">Onboard New Client</h2>
                <p className="text-sm text-[#7a6a4f] mt-1 text-justify">Create client accounts, assign initial services, and upload files.</p>
              </div>

              <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleCreateUser}>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-name">Full Name</label>
                  <input
                    id="admin-user-name"
                    value={userForm.name}
                    onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e] transition"
                    placeholder="Enter Full Name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-email">Email ID</label>
                  <div className="flex gap-2">
                    <input
                      id="admin-user-email"
                      type="email"
                      value={userForm.email}
                      onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                      className="w-full flex-1 rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e] disabled:bg-gray-100 disabled:text-gray-500 transition"
                      placeholder="Enter Email ID"
                      required
                      disabled={otpSent}
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || !userForm.email}
                      className="rounded-xl bg-[#5f4c2b] px-4 py-3 text-sm font-semibold text-white hover:bg-[#4d3d22] transition disabled:opacity-50 whitespace-nowrap"
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
                        className="rounded-xl bg-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  {otpError && <p className="text-xs text-red-600 font-semibold mt-1">{otpError}</p>}
                  {otpSent && !otpError && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">OTP sent to {otpSentEmail}.</p>
                  )}
                </div>

                {otpSent && (
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-otp">Email OTP Code (6 digits)</label>
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
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-mobile">Phone Number</label>
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
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-pan">PAN Card</label>
                  <input
                    id="admin-user-pan"
                    value={userForm.panCard}
                    onChange={(event) => setUserForm((current) => ({ ...current, panCard: event.target.value.toUpperCase() }))}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="Enter PAN Card"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-aadhaar">Aadhaar Card (Mandatory)</label>
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
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-dob">Date of Birth</label>
                  <input
                    id="admin-user-dob"
                    type="text"
                    inputMode="numeric"
                    autoComplete="bday"
                    value={userForm.dob}
                    onChange={(event) => setUserForm((current) => ({ ...current, dob: formatDobInput(event.target.value) }))}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="DD/MM/YYYY"
                    pattern="\d{2}/\d{2}/\d{4}"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-gender">Gender</label>
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
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-citizen">Citizen</label>
                  <input
                    id="admin-user-citizen"
                    value={userForm.citizen}
                    onChange={(event) => setUserForm((current) => ({ ...current, citizen: event.target.value }))}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="Enter Citizenship (e.g. Indian)"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-residential-status">Residential Status</label>
                  <input
                    id="admin-user-residential-status"
                    value={userForm.residentialStatus}
                    onChange={(event) => setUserForm((current) => ({ ...current, residentialStatus: event.target.value }))}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="Enter Residential Status"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="admin-user-firm">Firm Name</label>
                  <input
                    id="admin-user-firm"
                    value={userForm.firmName}
                    onChange={(event) => setUserForm((current) => ({ ...current, firmName: event.target.value }))}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="Enter Firm Name"
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
                  labelClassName="text-sm font-semibold text-[#3b2f1c]"
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
                  labelClassName="text-sm font-semibold text-[#3b2f1c]"
                  inputClassName="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 pr-20 outline-none focus:border-[#b89b5e]"
                  buttonClassName="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e5d7b6] bg-white px-3 py-1 text-xs font-semibold text-[#6b5b3e] transition hover:bg-[#f6efdf]"
                  placeholder="Confirm Password"
                />

                <div className="lg:col-span-2 grid gap-3 rounded-2xl border border-[#eadfc7] bg-[#fdf7eb]/60 p-5 shadow-sm">
                  <p className="text-sm font-bold text-[#4a3a22]">Service Taken (Sidebar Accessibility Options)</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ADMIN_SERVICE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-xs text-[#4a3a22] cursor-pointer hover:bg-white/40 p-1.5 rounded transition">
                        <input
                          type="checkbox"
                          checked={userForm.serviceAccess.includes(option.value)}
                          onChange={() => toggleService(option.value, "userForm")}
                          className="accent-[#b89b5e]"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Upload Section nested here */}
                <div id="upload-past-year" className="lg:col-span-2 grid gap-4 rounded-2xl border border-[#eadfc7] bg-[#fdf7eb]/60 p-5 shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-[#4a3a22]">Upload Past Year Documents</p>
                    <p className="text-xs text-[#7a6a4f] mt-1 text-justify">Add all 4 upload cards before creating the client user.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {YEARLY_UPLOAD_CARD_META.map((card) => {
                      const draft = yearlyUploadDrafts[card.key];

                      return (
                        <div key={card.key} className="flex flex-col md:flex-row md:items-end justify-between gap-4 rounded-2xl border border-[#eadfc7] bg-white p-4 shadow-sm min-w-0 overflow-hidden">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#3b2f1c]">{card.title}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                draft.file ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                              }`}>
                                {draft.file ? "Queued" : "Pending"}
                              </span>
                            </div>
                            <p className="text-xs text-[#7a6a4f] mt-0.5 leading-snug">{card.description}</p>
                          </div>

                          {card.slotOptions ? (
                            <div className="flex flex-wrap gap-2 md:mb-1">
                              {card.slotOptions.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() =>
                                    updateYearlyUploadDraft(card.key, (current) => ({
                                      ...current,
                                      slot,
                                    }))
                                  }
                                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                    draft.slot === slot
                                      ? "border-[#b89b5e] bg-[#f5e6c8] text-[#5f4c2b]"
                                      : "border-[#e5d7b6] bg-white text-[#7a6a4f] hover:bg-[#fbf4e7]"
                                  }`}
                                >
                                  {slot === "last_year_bs" ? "B/S" : "P/L"}
                                </button>
                              ))}
                            </div>
                          ) : null}

                          <div className="grid gap-1 w-full md:w-36 shrink-0">
                            <label className="text-[10px] font-semibold text-[#7a6a4f]" htmlFor={`${card.key}-year`}>
                              Select Year
                            </label>
                            <select
                              id={`${card.key}-year`}
                              value={draft.year}
                              onChange={(e) =>
                                updateYearlyUploadDraft(card.key, (current) => ({
                                  ...current,
                                  year: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-[#e5d7b6] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#b89b5e]"
                            >
                              <option value="2023">2023-2024</option>
                              <option value="2024">2024-2025</option>
                              <option value="2025">2025-2026</option>
                              <option value="2026">2026-2027</option>
                            </select>
                          </div>

                          <div className="grid gap-1 w-full md:w-64 min-w-0 overflow-hidden shrink-0">
                            <label className="text-[10px] font-semibold text-[#7a6a4f]" htmlFor={`${card.key}-file`}>
                              File
                            </label>
                            <input
                              id={`${card.key}-file`}
                              ref={(element) => {
                                yearlyUploadInputRefs.current[card.key] = element;
                              }}
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) =>
                                updateYearlyUploadDraft(card.key, (current) => ({
                                  ...current,
                                  file: e.target.files?.[0] || null,
                                }))
                              }
                              className="w-full max-w-full overflow-hidden text-ellipsis rounded-lg border border-[#e5d7b6] bg-white p-1 text-xs outline-none focus:border-[#b89b5e]"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => queueYearlyUpload(card.key)}
                            disabled={!draft.file}
                            className="w-full md:w-auto shrink-0 rounded-xl bg-[#5f4c2b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4d3d22] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Add file
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {queuedYearlyUploads.length > 0 && (
                    <div className="grid gap-2 rounded-2xl border border-[#eadfc7] bg-[#fffaf0] p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8a7340]">Queued Upload Files</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {queuedYearlyUploads.map((item) => (
                          <span
                            key={item.key}
                            className="inline-flex items-center gap-2 rounded-full border border-[#d9c9a4] bg-white px-3 py-1.5 text-xs font-semibold text-[#5c4a2e]"
                          >
                            {getYearlyDocumentLabel(item.slot)} · FY {formatFinancialYear(Number(item.year))}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-[#eadfc7]/55">
                  <p className="text-xs text-[#7a6a4f] text-justify">
                    {!otpSent ? "Verify client email first to enable creation." : "Password will be stored securely."}
                  </p>
                  <button
                    type="submit"
                    disabled={creatingUser || !otpSent || !userForm.otp || userForm.email.trim().toLowerCase() !== otpSentEmail.trim().toLowerCase()}
                    className="rounded-xl bg-gradient-to-r from-[#6b5b3e] to-[#b89b5e] hover:from-[#5c4e33] hover:to-[#a3874c] px-6 py-3 font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                  >
                    {creatingUser ? "Creating Account..." : "Create User Profile"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TAB 3: SERVICES ASSIGNMENT */}
          {activeTab === "service-access" && (
            <section id="service-access" className="rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-xl space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-[#3b2f1c] sm:text-2xl">Service Access Control</h2>
                <p className="text-sm text-[#7a6a4f] mt-1 text-justify">Enable sidebar sections on client dashboards.</p>
              </div>

              <form className="space-y-4" onSubmit={handleAssignServiceAccess}>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#3b2f1c]" htmlFor="service-access-email">Select Client Profile</label>
                  <input
                    id="service-access-email"
                    list="admin-profile-emails"
                    value={serviceEmail}
                    onChange={(event) => setServiceEmail(event.target.value)}
                    className="w-full rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
                    placeholder="Type client email..."
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

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl border border-[#f0e6d3] p-4 bg-[#fffdfa]">
                  {ADMIN_SERVICE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-xs text-[#4a3a22] cursor-pointer hover:bg-[#faf6ed] p-1.5 rounded transition">
                      <input
                        type="checkbox"
                        checked={serviceAccess.includes(option.value)}
                        onChange={() => toggleService(option.value, "serviceAccess")}
                        className="accent-[#b89b5e]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={savingServiceAccess}
                  className="rounded-xl bg-[#5f4c2b] hover:bg-[#4d3d22] px-6 py-3 text-sm font-semibold text-white disabled:opacity-70 shadow transition"
                >
                  {savingServiceAccess ? "Saving Services..." : "Save Assigned Services"}
                </button>
              </form>
            </section>
          )}

          {/* TAB 4: CONSULTATION REQUESTS */}
          {activeTab === "consultation-requests" && (
            <section id="consultation-requests" className="rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#3b2f1c] sm:text-2xl">Consultation Enquiries</h2>
                  <p className="text-sm text-[#7a6a4f] mt-1 text-justify">Review callback and service consultation requests.</p>
                </div>
                <button type="button" onClick={loadData} className="rounded-lg border border-[#e5d7b6] px-3 py-1.5 text-xs font-semibold text-[#8a7340] hover:bg-[#faf6ed] transition">
                  Refresh
                </button>
              </div>

              {loading ? (
                <p className="text-sm text-[#7a6a4f] py-4 text-center">Loading requests...</p>
              ) : consultationRequests.length === 0 ? (
                <p className="text-sm text-[#7a6a4f] py-4 text-center">No consultation requests yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#f0e6d3]">
                  <table className="min-w-full divide-y divide-[#eadfc7] text-sm">
                    <thead className="bg-[#fbfaf6]">
                      <tr className="text-left text-[#8a7340]">
                        <th className="py-3 px-4 font-bold">Client Name</th>
                        <th className="py-3 px-4 font-bold">Email</th>
                        <th className="py-3 px-4 font-bold">Phone</th>
                        <th className="py-3 px-4 font-bold">Service Info</th>
                        <th className="py-3 px-4 font-bold">Enquiry Note</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0e6d3] bg-white">
                      {consultationRequests.map((item) => (
                        <tr key={item.id} className="hover:bg-[#fffcf7] transition-colors">
                          <td className="py-4 px-4 font-semibold text-[#3b2f1c]">{item.fullName}</td>
                          <td className="py-4 px-4 text-gray-600">{item.email}</td>
                          <td className="py-4 px-4 text-gray-600">{item.phone}</td>
                          <td className="py-4 px-4 text-gray-600">
                            <span className="font-semibold text-xs bg-amber-55 text-[#5c4c2f] px-2 py-0.5 rounded-full border border-amber-200">
                              {item.serviceName}
                            </span>
                            {item.firmName && <p className="text-[10px] text-gray-500 mt-1">{item.firmName}</p>}
                          </td>
                          <td className="py-4 px-4 max-w-[200px] truncate text-gray-600" title={item.note || ""}>
                            {item.note || "-"}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={item.status}
                              onChange={(event) => updateStatus(item.id, event.target.value as ConsultationRequest["status"])}
                              className="rounded-lg border border-[#e5d7b6] bg-white px-2 py-1 text-xs text-[#3b2f1c] font-semibold outline-none focus:border-[#b89b5e] transition"
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-500">{formatDisplayDate(item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* TAB 5: REGISTERED PROFILES (CLICK TO MANAGE) */}
          {activeTab === "registered-profiles" && (
            <section id="registered-profiles" className="rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-xl space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-[#3b2f1c] sm:text-2xl">Client Profiles</h2>
                <p className="text-sm text-[#7a6a4f] mt-1 text-justify">Select a client below to access, upload documents, and manage assigned services.</p>
              </div>

              {loading ? (
                <p className="text-sm text-[#7a6a4f] py-4 text-center">Loading profiles...</p>
              ) : profiles.length === 0 ? (
                <p className="text-sm text-[#7a6a4f] py-4 text-center">No profiles found.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#f0e6d3]">
                  <table className="min-w-full divide-y divide-[#eadfc7] text-sm">
                    <thead className="bg-[#fbfaf6]">
                      <tr className="text-left text-[#8a7340]">
                        <th className="py-3 px-4 font-bold">Client Name</th>
                        <th className="py-3 px-4 font-bold">Email</th>
                        <th className="py-3 px-4 font-bold">Phone</th>
                        <th className="py-3 px-4 font-bold">Firm Name</th>
                        <th className="py-3 px-4 font-bold">Created On</th>
                        <th className="py-3 px-4 font-bold">Access Status</th>
                        <th className="py-3 px-4 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0e6d3] bg-white">
                      {profiles.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => {
                            handleViewUserDocuments(item);
                            setModalServiceAccess(decodeServiceAccess(item.serviceAccess));
                          }}
                          className="hover:bg-[#fffcf5] cursor-pointer transition duration-150"
                        >
                          <td className="py-4 px-4 font-semibold text-[#3b2f1c]">{item.fullName}</td>
                          <td className="py-4 px-4 text-gray-600">{item.email}</td>
                          <td className="py-4 px-4 text-gray-600">{item.phone}</td>
                          <td className="py-4 px-4 text-gray-600">{item.firmName || "-"}</td>
                          <td className="py-4 px-4 text-xs text-gray-500">{formatDisplayDate(item.createdAt)}</td>
                          <td className="py-4 px-4">
                            {item.userId ? (
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                REGISTERED
                              </span>
                            ) : (
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                PROFILE ONLY
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              type="button"
                              className="rounded-lg bg-[#faf0da] px-3 py-1.5 text-xs font-semibold text-[#8a7340] hover:bg-[#b89b5e] hover:text-white transition duration-150"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* TAB 6: PAST YEAR UPLOADS GRID */}
          {activeTab === "past-year-uploads" && (
            <section id="past-year-uploads" className="rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-xl space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#3b2f1c] sm:text-2xl">Uploaded Yearly Documents</h2>
                  <p className="text-sm text-[#7a6a4f] mt-1 text-justify">Review documents grouped by financial year and client.</p>
                </div>
                <button type="button" onClick={loadYearlyDocuments} className="rounded-lg border border-[#e5d7b6] px-3 py-1.5 text-xs font-semibold text-[#8a7340] hover:bg-[#faf6ed] transition">
                  Refresh
                </button>
              </div>

              {loadingYearlyDocuments ? (
                <p className="text-sm text-[#7a6a4f] py-4 text-center">Loading documents...</p>
              ) : yearlyDocumentsError ? (
                <p className="text-sm text-red-600 py-4 text-center">{yearlyDocumentsError}</p>
              ) : Object.keys(groupedYearlyDocs).length === 0 ? (
                <p className="text-sm text-[#7a6a4f] py-4 text-center">No past year uploads found.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedYearlyDocs)
                    .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort years descending
                    .map(([yearKey, usersMap]) => {
                      const isExpanded = activeYearAccordion === yearKey;
                      const clientsCount = Object.keys(usersMap).length;

                      return (
                        <div key={yearKey} className="rounded-2xl border border-[#e8dcc0] overflow-hidden bg-white shadow-sm transition">
                          {/* Accordion Header */}
                          <button
                            type="button"
                            onClick={() => setActiveYearAccordion(isExpanded ? null : yearKey)}
                            className="w-full flex items-center justify-between p-4 bg-[#fbf9f4] hover:bg-[#faf6ed] transition text-[#3b2f1c] font-semibold text-base border-b border-[#e8dcc0]"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">📅</span>
                              <span>Financial Year {formatFinancialYear(Number(yearKey))}</span>
                              <span className="rounded-full bg-[#f0e4cc] px-2 py-0.5 text-xs font-bold text-[#8a7340]">
                                {clientsCount} {clientsCount === 1 ? "Client" : "Clients"}
                              </span>
                            </div>
                            <span className="text-sm text-[#8a7340] font-bold">
                              {isExpanded ? "▲ Collapse" : "▼ Expand"}
                            </span>
                          </button>

                          {/* Accordion Content */}
                          {isExpanded && (
                            <div className="p-4 bg-white divide-y divide-[#f3ebda]">
                              {Object.entries(usersMap).map(([userId, clientData]) => (
                                <div key={userId} className="py-4 first:pt-0 last:pb-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                  {/* Client Info */}
                                  <div className="xl:w-1/4 min-w-0">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#b89b5e] to-[#d6b86a] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {clientData.userName.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-bold text-sm text-[#3b2f1c] truncate">{clientData.userName}</h4>
                                        <p className="text-xs text-gray-500 truncate">{clientData.userEmail}</p>
                                        {clientData.userPhone && (
                                          <p className="text-[10px] text-gray-400 mt-0.5">{clientData.userPhone}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Documents Row */}
                                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    {(["itr", "computation", "pl", "bs"] as YearlyUploadCardKey[]).map((slotKey) => {
                                      const doc = clientData.docs[slotKey];
                                      const label = slotKey === "itr" ? "ITR" : slotKey === "computation" ? "Computation" : slotKey === "pl" ? "P/L Statement" : "Balance Sheet";

                                      if (doc) {
                                        return (
                                          <div key={slotKey} className="flex flex-col justify-between p-3 rounded-xl border border-[#e8dcc0] bg-[#faf8f4] hover:bg-[#f6efdf] transition gap-2 min-w-0">
                                            <div className="min-w-0">
                                              <p className="text-[11px] font-bold text-[#8a7340] uppercase tracking-wider">{label}</p>
                                              <p className="text-xs font-medium text-[#3b2f1c] mt-1 truncate" title={doc.fileName}>
                                                {doc.fileName}
                                              </p>
                                              <p className="text-[9px] text-gray-400 mt-0.5">
                                                Uploaded {formatDisplayDate(doc.createdAt)}
                                              </p>
                                            </div>
                                            {doc.signedUrl ? (
                                              <a
                                                href={doc.signedUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full text-center rounded-lg bg-[#b89b5e] hover:bg-[#a3874c] py-1.5 text-xs font-semibold text-white transition block mt-1"
                                              >
                                                View Document
                                              </a>
                                            ) : (
                                              <span className="w-full text-center text-[10px] font-medium text-red-500 block py-1.5 mt-1">
                                                Link Unavailable
                                              </span>
                                            )}
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={slotKey} className="flex flex-col justify-center items-center p-4 rounded-xl border border-dashed border-[#eadfc7] bg-gray-50/50 text-center gap-1">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                                            <span className="text-[10px] text-gray-400 italic mt-1">
                                              Not Uploaded
                                            </span>
                                          </div>
                                        );
                                      }
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Unified User Details / Documents / Services Modal */}
      {selectedUserForDocs && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-6xl rounded-3xl border border-[#e8dcc0] bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0e6d3] pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#3b2f1c] flex items-center gap-2">
                  <span>Manage Client:</span>
                  <span className="text-[#8a7340]">{selectedUserForDocs.fullName}</span>
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

            {/* Split-pane Modal Content Layout */}
            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
              {/* Left Column: Profile Card & Service access editor */}
              <div className="space-y-6 lg:border-r lg:border-[#f0e6d3] lg:pr-6">
                {/* Profile Meta Info card */}
                <div className="rounded-2xl border border-[#e8dcc0]/70 bg-[#fffdfa] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#b89b5e] to-[#d6b86a] flex items-center justify-center text-white text-lg font-bold">
                      {selectedUserForDocs.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#3b2f1c] text-sm truncate max-w-[150px]">{selectedUserForDocs.fullName}</h4>
                      <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedUserForDocs.userId
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {selectedUserForDocs.userId ? "Registered Client" : "Profile Only"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-[#5c4c2f] space-y-2 pt-2 border-t border-[#f3ebda]">
                    <p><strong>Email:</strong> {selectedUserForDocs.email}</p>
                    <p><strong>Phone:</strong> {selectedUserForDocs.phone}</p>
                    {selectedUserForDocs.firmName && <p><strong>Firm Name:</strong> {selectedUserForDocs.firmName}</p>}
                    <p><strong>Created On:</strong> {formatDisplayDate(selectedUserForDocs.createdAt)}</p>
                  </div>
                </div>

                {/* Services Assignment Block */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#f3ebda] pb-1">
                    <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8a7340]">
                      Services Taken
                    </h4>
                  </div>
                  {selectedUserForDocs.userId ? (
                    <div className="space-y-4">
                      <div className="max-h-[260px] overflow-y-auto rounded-xl border border-[#e8dcc0] p-3 bg-[#fdfdfc] space-y-1">
                        {ADMIN_SERVICE_OPTIONS.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 text-xs text-[#4a3a22] cursor-pointer hover:bg-[#faf6ed] p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={modalServiceAccess.includes(option.value)}
                              onChange={() =>
                                setModalServiceAccess((current) =>
                                  current.includes(option.value)
                                    ? current.filter((v) => v !== option.value)
                                    : [...current, option.value]
                                )
                              }
                              className="accent-[#b89b5e]"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveModalServiceAccess}
                        disabled={savingModalServiceAccess}
                        className="w-full rounded-xl bg-[#5f4c2b] hover:bg-[#4d3d22] py-3 text-xs font-semibold text-white transition disabled:opacity-50 shadow-md"
                      >
                        {savingModalServiceAccess ? "Saving Services..." : "Save Assigned Services"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 p-3 rounded-xl leading-relaxed text-justify">
                      This user has not registered a login account password yet. Onboard them via the Onboarding tab first.
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: User Documents Viewer */}
              <div className="space-y-6">
                {loadingUserDocs ? (
                  <p className="text-center text-sm text-[#7a6a4f] py-12 animate-pulse">Loading documents...</p>
                ) : userDocsError ? (
                  <p className="text-center text-sm text-red-600 py-12">{userDocsError}</p>
                ) : userDocuments.length === 0 ? (
                  <p className="text-center text-sm text-[#7a6a4f] py-12">No documents uploaded by this user yet.</p>
                ) : (
                  <div className="space-y-6">
                    {/* General Documents List */}
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

                    {/* Yearly Documents List */}
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

                    {/* Service Specific Documents */}
                    {(() => {
                      const service = userDocuments.filter(d => d.documentType.startsWith("service:"));
                      if (service.length === 0) return null;
                      return (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm uppercase tracking-wider text-[#8a7340] border-b border-[#f3ebda] pb-1">Service Uploads</h4>
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
          </div>
        </div>
      )}

      {/* Due/WIP/Complete Tasks Modal */}
      {viewingTasksType && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
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
              <div className="overflow-x-auto rounded-2xl border border-[#f0e6d3]">
                <table className="min-w-full divide-y divide-[#eadfc7] text-sm">
                  <thead className="bg-[#fbfaf6]">
                    <tr className="text-left text-[#8a7340]">
                      <th className="py-3 px-4 font-semibold">User Details</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold">Service Name</th>
                      <th className="py-3 px-4 font-semibold">Details</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Action / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0e6d3] bg-white text-[#3b2f1c]">
                    {(viewingTasksType === "due" ? stats.dueTasksList : viewingTasksType === "wip" ? stats.wipTasksList : stats.completeTasksList).map((task) => (
                      <tr key={task.id} className="hover:bg-[#fffdf8] transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-sm">{task.userName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{task.userEmail}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{task.userPhone || "-"}</p>
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
                          {formatDisplayDate(task.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {task.userId && (
                              <button
                                type="button"
                                onClick={() => handleViewUserFromTask(task.userId || "", task.userName, task.userEmail, task.userPhone)}
                                className="rounded-lg bg-[#faf0da] px-3 py-1.5 text-xs font-semibold text-[#8a7340] hover:bg-[#b89b5e] hover:text-white transition duration-150"
                              >
                                Manage Client
                              </button>
                            )}

                            {task.type === "document" ? (
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
                                className="rounded-lg border border-[#e5d7b6] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#b89b5e]"
                              >
                                <option value="uploaded">Uploaded (Due)</option>
                                <option value="verified">Verified (WIP)</option>
                                <option value="completed">Completed (ITR Filed)</option>
                              </select>
                            ) : (
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
                                className="rounded-lg border border-[#e5d7b6] bg-white px-2 py-1.5 text-xs outline-none focus:border-[#b89b5e]"
                              >
                                <option value="pending">Pending</option>
                                <option value="seen">Seen</option>
                                <option value="contacted">Completed</option>
                              </select>
                            )}
                          </div>
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
