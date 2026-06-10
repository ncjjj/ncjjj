"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import PasswordInput from "../common/PasswordInput";
import { toast } from "../common/ToastContainer";
import { ADMIN_SERVICE_OPTIONS, decodeServiceAccess } from "../../lib/serviceAccess";
import {
  formatFinancialYear,
  getYearlyDocumentLabel,
  type YearlyDocumentSlot,
} from "../../lib/yearlyDocumentTypes";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setAdminProfile,
  setConsultationRequests,
  updateConsultationRequest,
  setProfiles,
  setStats,
  setSocketStatus,
  setActiveTab,
  setAdminLoading,
  setAdminLoadingStats,
  updateTaskStatus,
} from "../../store/slices/adminSlice";

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
  panCard?: string | null;
  aadhaarCard?: string | null;
  dob?: string | null;
  gender?: string | null;
  citizen?: string | null;
  residentialStatus?: string | null;
  passwordPlain?: string | null;
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
  fatherName: string;
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
  id: string;
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
    fatherName: "",
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
  const dispatch = useAppDispatch();

  // ── Redux global state ────────────────────────────────────────────────────
  const adminProfile = useAppSelector((s) => s.admin.adminProfile);
  const consultationRequests = useAppSelector((s) => s.admin.consultationRequests);
  const profiles = useAppSelector((s) => s.admin.profiles);
  const stats = useAppSelector((s) => s.admin.stats);
  const socketStatus = useAppSelector((s) => s.admin.socketStatus);
  const activeTab = useAppSelector((s) => s.admin.activeTab);
  const loading = useAppSelector((s) => s.admin.loading);
  const loadingStats = useAppSelector((s) => s.admin.loadingStats);

  // ── Local UI state (component-scoped, not shared) ─────────────────────────
  const [message, setMessage] = useState<{ type: "error" | "success" | ""; text: string }>({ type: "", text: "" });
  const [userForm, setUserForm] = useState<CreateUserFormState>(emptyUserForm);
  const [creatingUser, setCreatingUser] = useState(false);
  const [serviceEmail, setServiceEmail] = useState("");
  const [serviceAccess, setServiceAccess] = useState<string[]>([]);
  const [savingServiceAccess, setSavingServiceAccess] = useState(false);
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewingTasksType, setViewingTasksType] = useState<"due" | "wip" | "complete" | null>(null);
  const [viewingServiceDocumentsUserId, setViewingServiceDocumentsUserId] = useState<string | null>(null);
  const [viewingServiceDocumentsUserName, setViewingServiceDocumentsUserName] = useState<string | null>(null);
  const [serviceDocumentsData, setServiceDocumentsData] = useState<any[]>([]);
  const [loadingServiceDocuments, setLoadingServiceDocuments] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const loadStats = async (silent = false) => {
    if (!silent) {
      dispatch(setAdminLoadingStats(true));
    }
    try {
      const response = await fetch("/api/admin/dashboard-stats", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load stats: ${response.status} ${response.statusText}`);
      }
      const payload = await response.json().catch(() => null);
      if (payload) {
        dispatch(setStats(payload));
      }
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      if (!silent) {
        dispatch(setAdminLoadingStats(false));
      }
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      if (res.ok) {
        const data = await res.json();
        dispatch(setAdminProfile(data.admin));
      }
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  };

  const loadServiceDocumentsForUser = async (userId: string, userName: string) => {
    setLoadingServiceDocuments(true);
    try {
      const response = await fetch(`/api/admin/documents?userId=${userId}&category=service`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load documents: ${response.status}`);
      }
      const payload = await response.json();
      const docs = payload.documents || [];
      
      // Group documents by documentType (service:income-tax, service:gst, etc.)
      const grouped: Record<string, any[]> = {};
      docs.forEach((doc: any) => {
        const key = doc.documentType || "other";
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(doc);
      });
      
      // Sort within each group by createdAt (newest first)
      Object.keys(grouped).forEach(key => {
        if (grouped[key]) {
          grouped[key].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      });
      
      setServiceDocumentsData(Object.entries(grouped).map(([key, items]) => ({
        documentType: key,
        documents: items
      })));
      setViewingServiceDocumentsUserId(userId);
      setViewingServiceDocumentsUserName(userName);
    } catch (err) {
      console.error("Failed to load service documents", err);
      toast?.error("Failed to load service documents.");
    } finally {
      setLoadingServiceDocuments(false);
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

  // Local state for editing user in modal
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editFirmName, setEditFirmName] = useState("");
  const [editPanCard, setEditPanCard] = useState("");
  const [editAadhaarCard, setEditAadhaarCard] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editCitizen, setEditCitizen] = useState("");
  const [editResidentialStatus, setEditResidentialStatus] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [savingClientInfo, setSavingClientInfo] = useState(false);

  useEffect(() => {
    if (selectedUserForDocs) {
      setEditFullName(selectedUserForDocs.fullName || "");
      setEditEmail(selectedUserForDocs.email || "");
      setEditPhone(selectedUserForDocs.phone || "");
      setEditFirmName(selectedUserForDocs.firmName || "");
      setEditPanCard(selectedUserForDocs.panCard || "");
      setEditAadhaarCard(selectedUserForDocs.aadhaarCard || "");
      setEditDob(selectedUserForDocs.dob || "");
      setEditGender(selectedUserForDocs.gender || "");
      setEditCitizen(selectedUserForDocs.citizen || "");
      setEditResidentialStatus(selectedUserForDocs.residentialStatus || "");
      setEditPassword("");
    }
  }, [selectedUserForDocs]);
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

  const loadData = async (silent = false) => {
    if (!silent) {
      dispatch(setAdminLoading(true));
    }

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

      dispatch(setConsultationRequests(requestsPayload.consultationRequests || []));
      dispatch(setProfiles(profilesPayload.profiles || []));
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to load admin data." });
    } finally {
      if (!silent) {
        dispatch(setAdminLoading(false));
      }
    }
  };

  const loadYearlyDocuments = async (silent = false) => {
    if (!silent) {
      setLoadingYearlyDocuments(true);
      setYearlyDocumentsError("");
    }

    try {
      const response = await fetch("/api/admin/documents?category=yearly", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { documents?: AdminYearlyDocumentRow[]; message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load yearly documents.");
      }

      setYearlyDocuments(payload?.documents || []);
    } catch (error) {
      if (!silent) {
        setYearlyDocumentsError(error instanceof Error ? error.message : "Unable to load yearly documents.");
      }
    } finally {
      if (!silent) {
        setLoadingYearlyDocuments(false);
      }
    }
  };

  const selectedUserRef = useRef(selectedUserForDocs);
  useEffect(() => {
    selectedUserRef.current = selectedUserForDocs;
  }, [selectedUserForDocs]);

  useEffect(() => {
    if (message.text) {
      if (message.type === "success") {
        toast?.success(message.text);
      } else if (message.type === "error") {
        toast?.error(message.text);
      } else {
        toast?.info(message.text);
      }
      setMessage({ type: "", text: "" });
    }
  }, [message]);

  useEffect(() => {
    loadData();
    loadYearlyDocuments();
    loadStats();
    fetchAdminProfile();

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
          dispatch(setSocketStatus("connected"));
        });

        socket.on("disconnect", () => {
          dispatch(setSocketStatus("disconnected"));
        });

        socket.on("admin-update", (payload: any) => {
          console.log("Admin received real-time update event:", payload);
          
          if (payload?.type === "document-status-updated" && payload?.data) {
            dispatch(updateTaskStatus({
              taskId: payload.data.documentId,
              type: "document",
              newStatus: payload.data.uploadStatus,
            }));
          } else if (payload?.type === "consultation-request-updated" && payload?.data) {
            dispatch(updateTaskStatus({
              taskId: payload.data.id,
              type: "consultation",
              newStatus: payload.data.status,
            }));
            dispatch(updateConsultationRequest(payload.data));
          }

          loadData(true);
          loadYearlyDocuments(true);
          loadStats(true);
          if (selectedUserRef.current) {
            handleViewUserDocuments(selectedUserRef.current, true);
          }
        });
      } catch (err) {
        console.error("Failed to connect admin socket", err);
      }
    };

    connectSocket();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (socket) {
        socket.disconnect();
      }
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // (Profile settings removed — admin profile data lives in Redux store)

  const handleViewUserDocuments = async (user: ProfileRow, silent = false) => {
    setSelectedUserForDocs(user);
    if (!silent) {
      setLoadingUserDocs(true);
      setUserDocsError("");
      setUserDocuments([]);
    }

    try {
      const targetUserId = user.userId || user.id;
      const response = await fetch(`/api/admin/documents?userId=${targetUserId}`);
      if (!response.ok) {
        throw new Error(`Failed to load documents: ${response.status} ${response.statusText}`);
      }
      const payload = await response.json().catch(() => ({}));
      setUserDocuments(payload.documents || []);
    } catch (err: any) {
      if (!silent) {
        setUserDocsError(err.message || "Failed to load user documents.");
      }
    } finally {
      if (!silent) {
        setLoadingUserDocs(false);
      }
    }
  };

  const handleSaveClientInfo = async () => {
    if (!selectedUserForDocs) return;
    if (editPhone.length !== 10) {
      toast?.error("Phone number must be exactly 10 digits.");
      return;
    }

    setSavingClientInfo(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUserForDocs.id,
          fullName: editFullName,
          email: editEmail,
          phone: editPhone,
          firmName: editFirmName || null,
          panCard: editPanCard || null,
          aadhaarCard: editAadhaarCard || null,
          dob: editDob || null,
          gender: editGender || null,
          citizen: editCitizen || null,
          residentialStatus: editResidentialStatus || null,
          password: editPassword || "",
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast?.error(payload?.message || "Failed to update client details.");
        return;
      }

      toast?.success("Client details updated successfully.");

      const updatedProfile: ProfileRow = {
        ...selectedUserForDocs,
        fullName: editFullName,
        email: editEmail,
        phone: editPhone,
        firmName: editFirmName || null,
        panCard: editPanCard || null,
        aadhaarCard: editAadhaarCard || null,
        dob: editDob || null,
        gender: editGender || null,
        citizen: editCitizen || null,
        residentialStatus: editResidentialStatus || null,
        ...(editPassword && { passwordPlain: editPassword }),
      };

      setSelectedUserForDocs(updatedProfile);
      await loadData(true);
    } catch {
      toast?.error("Unable to update client details right now.");
    } finally {
      setSavingClientInfo(false);
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

      dispatch(setProfiles(
        profiles.map((item) =>
          item.id === selectedUserForDocs.id
            ? { ...item, serviceAccess: modalServiceAccess.join(",") }
            : item
        )
      ));

      setSelectedUserForDocs((current) =>
        current ? { ...current, serviceAccess: modalServiceAccess.join(",") } : null
      );

      toast?.success("Services updated successfully.");
    } catch (err: any) {
      toast?.error(err.message || "Failed to update services.");
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
      <div key={doc.id} className="flex flex-col justify-between p-4 rounded-2xl border border-amber-200 bg-white shadow-sm hover:bg-amber-50/20 hover:shadow transition duration-200 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs">
            📄
          </div>
          <div className="min-w-0 font-medium flex-1">
            <p className="font-semibold text-sm text-stone-800 truncate" title={doc.fileName}>{doc.fileName}</p>
            <p className="text-xs text-amber-700 mt-0.5">{getDocTypeLabel(doc)}</p>
            {doc.mimeType && <p className="text-[10px] text-stone-400 mt-0.5">{doc.mimeType}</p>}
            {doc.uploadStatus && !isYearly && (
              <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                doc.uploadStatus === "completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : doc.uploadStatus === "verified"
                  ? "bg-sky-100 text-sky-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {doc.uploadStatus === "completed"
                  ? "Completed "
                  : doc.uploadStatus === "verified"
                  ? "Verified"
                  : "Uploaded"}
              </span>
            )}
          </div>
        </div>

        {!isYearly && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-100">
            <span className="text-xs font-semibold text-stone-700">Verify Status:</span>
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
                    await handleViewUserDocuments(selectedUserForDocs, true);
                  }
                  await loadStats(true);
                } catch (err) {
                  toast?.error("Failed to update status");
                }
              }}
              className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs text-stone-800 font-medium outline-none focus:border-amber-500"
            >
              <option value="uploaded">Uploaded (Due)</option>
              <option value="verified">Verified (WIP)</option>
              <option value="completed">Completed (ITR Filed)</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-amber-100">
          <span className="text-[10px] text-stone-500">
            Uploaded {formatDisplayDate(doc.createdAt)}
          </span>
          {doc.signedUrl ? (
            <a
              href={doc.signedUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 transition"
            >
              View Document
            </a>
          ) : (
            <span className="text-xs text-rose-500 font-medium">Link Unavailable</span>
          )}
        </div>
      </div>
    );
  };

  const renderYearlyUploadCard = (doc: AdminYearlyDocumentRow) => {
    return (
      <div key={doc.id} className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition hover:bg-amber-50/20 hover:shadow space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-xs text-white">
            📄
          </div>
          <div className="min-w-0 font-medium flex-1">
            <p className="truncate text-sm font-semibold text-stone-800" title={doc.fileName}>{doc.fileName}</p>
            <p className="text-xs text-amber-700 mt-0.5">{getDocTypeLabel(doc)}</p>
            <p className="text-[10px] text-stone-500 mt-1">
              {doc.userName || "Unknown user"} {doc.userEmail ? `• ${doc.userEmail}` : ""}
            </p>
            {doc.userPhone ? <p className="text-[10px] text-stone-400 mt-0.5">{doc.userPhone}</p> : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-amber-100 pt-2">
          <span className="text-[10px] text-stone-500">Uploaded {formatDisplayDate(doc.createdAt)}</span>
          {doc.signedUrl ? (
            <a
              href={doc.signedUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200"
            >
              View Document
            </a>
          ) : (
            <span className="text-xs font-medium text-rose-500">Link Unavailable</span>
          )}
        </div>
      </div>
    );
  };

  const updateStatus = async (requestId: string, status: ConsultationRequest["status"], silent = false) => {
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

    dispatch(updateConsultationRequest(payload.consultationRequest!));
    void loadStats(silent);
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

    const uniqueId = Math.random().toString(36).substring(2, 9) + Date.now();

    setQueuedYearlyUploads((current) => {
      return [...current, { id: uniqueId, key, slot: draft.slot, year: draft.year.trim(), file }];
    });

    updateYearlyUploadDraft(key, (current) => createYearlyUploadDraft(current.slot, current.year));

    const input = yearlyUploadInputRefs.current[key];
    if (input) {
      input.value = "";
    }

    setMessage({ type: "success", text: `${getYearlyDocumentLabel(draft.slot)} added to the upload queue.` });
  };

  const removeQueuedYearlyUpload = (id: string) => {
    setQueuedYearlyUploads((current) => current.filter((item) => item.id !== id));
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

    // Upload queue can contain any number of files (0, 1, 2, etc.)

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
      dispatch(setActiveTab("registered-profiles"));
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

  // Profile settings section removed per requirements.

  return (
    <div className="min-h-screen bg-[#fffcf5] text-stone-800 flex flex-col font-sans">
      {/* Premium Sticky Topbar Navigation Header */}
      <header className="sticky top-0 z-40 w-full bg-[#1c160c] text-[#f5efe4] border-b border-amber-900/40 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-amber-200 hover:bg-stone-800 transition"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Legal Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-sm">
              <img src="/images/ncj.jpeg" alt="NCJ Logo" className="h-8 w-auto object-contain rounded-xs" />
              <img src="/images/ngoo.jpeg" alt="NGO Logo" className="h-8 w-auto object-contain rounded-xs" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-widest uppercase text-amber-400">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">


          {/* Admin profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-stone-900 border border-amber-900/40 px-3 py-1.5 rounded-full hover:bg-stone-850 transition duration-150 text-left outline-none"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-stone-900 font-bold text-xs shadow-inner">
                {adminProfile ? adminProfile.username.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="hidden md:block min-w-0">
                <p className="text-xs font-semibold leading-tight truncate w-24 text-stone-200">
                  {adminProfile ? adminProfile.username : "Loading..."}
                </p>
                <p className="text-[9px] text-amber-400 font-medium tracking-wide">System Admin</p>
              </div>
              <svg className={`w-3.5 h-3.5 text-amber-400/80 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-amber-900/30 bg-stone-950 text-[#f5efe4] p-2 shadow-2xl z-[9999] animate-fade-in">
                <div className="px-3 py-2 border-b border-stone-800/80 mb-1">
                  <p className="text-xs text-stone-400">Signed in as</p>
                  <p className="text-sm font-semibold truncate text-stone-200">{adminProfile?.username || "Admin"}</p>
                  <p className="text-[10px] text-stone-400 truncate mt-0.5">{adminProfile?.email}</p>
                </div>
                <div className="h-px bg-stone-900 my-1" />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-xs text-rose-400 rounded-xl hover:bg-rose-950/40 hover:text-rose-300 transition font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout Session
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex relative">
        {/* Left Sidebar Menu */}
        <aside
          className={`lg:w-64 w-64 bg-[#231b10] text-[#eae2d5] border-r border-amber-950/50 p-4 shrink-0 flex flex-col justify-between fixed lg:sticky top-[61px] lg:h-[calc(100vh-61px)] lg:overflow-y-auto bottom-0 left-0 z-30 transition-transform duration-300 transform lg:translate-x-0 ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-6">
            <nav className="space-y-1">
              {[
                {
                  id: "overview",
                  label: "Dashboard",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                    </svg>
                  ),
                },

                {
                  id: "service-access",
                  label: "Service Access",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  id: "consultation-requests",
                  label: "Consultation Requests",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ),
                },
                {
                  id: "registered-profiles",
                  label: "Client Profiles",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                },
                {
                  id: "past-year-uploads",
                  label: "Document Archive",
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  ),
                },

              ].map((item) => {
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      dispatch(setActiveTab(item.id));
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold tracking-wide transition-all duration-150 ${
                      isSelected
                        ? "bg-amber-400 text-stone-950 shadow-md font-bold"
                        : "text-amber-100/70 hover:bg-stone-800/60 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="text-[10px] text-stone-500/80 font-medium px-2 leading-relaxed mt-8">
            <p className="font-semibold text-stone-400">NCJ Legal LLP</p>
            <p>Admin Portal v1.0.0</p>
            <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">


          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <section id="overview" className="space-y-6 animate-fade-in">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-amber-200/40 pb-4">
                <div>
                  <h1 className="text-2xl font-bold font-serif tracking-tight text-stone-900">Dashboard</h1>
                </div>
                <button
                  onClick={() => loadStats()}
                  className="self-start md:self-auto rounded-xl border border-amber-300 bg-white hover:bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 transition shadow-xs"
                >
                  Refresh Analytics
                </button>
              </div>

              {loadingStats ? (
                <div className="flex items-center justify-center p-20 rounded-3xl border border-amber-200 bg-white shadow-xs">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    <span className="text-xs text-stone-500 font-medium">Loading statistics...</span>
                  </div>
                </div>
              ) : stats ? (
                <div className="space-y-6">
                  {/* Row 1: Users Stats Cards */}
                  <div>
                    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">User Analytics</h3>
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: "Registered Users", count: stats.totalRegisteredUsers, desc: "Total system accounts", emoji: "👥" },
                        { label: "Income Tax Users", count: stats.totalIncomeTaxUsers, desc: "Access to Income Tax", emoji: "📄" },
                        { label: "GST Users", count: stats.totalGstUsers, desc: "Access to GST", emoji: "🛍️" },
                        { label: "TDS Users", count: stats.totalTdsUsers, desc: "Access to TDS", emoji: "💼" },
                      ].map((card, i) => (
                        <div key={i} className="group rounded-3xl border border-amber-200 bg-white p-5 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500">{card.label}</span>
                            <span className="text-xl">{card.emoji}</span>
                          </div>
                          <p className="mt-4 text-3xl font-extrabold text-stone-900 tracking-tight">{card.count}</p>
                          <p className="mt-1 text-[10px] text-stone-500">{card.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 2: Income Tax Pendency */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800">
                        Income Tax Return Pendency Status
                      </h3>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                        TY {stats.currentFinancialYear}
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Due Task Count (Red) */}
                      <div
                        onClick={() => setViewingTasksType("due")}
                        className="group cursor-pointer rounded-3xl border border-rose-200 bg-rose-50/30 p-5 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-rose-800">Due Task Count</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-sm">⚠️</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-rose-900 tracking-tight">{stats.totalDueTasks}</p>
                        <p className="mt-1 text-[10px] text-rose-700">Click to view all pending tasks and user uploads</p>
                      </div>

                      {/* Work In Progress (Blue) */}
                      <div
                        onClick={() => setViewingTasksType("wip")}
                        className="group cursor-pointer rounded-3xl border border-sky-200 bg-sky-50/30 p-5 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-sky-850">Work In Progress</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm">⚙️</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-sky-900 tracking-tight">{stats.totalWipTasks}</p>
                        <p className="mt-1 text-[10px] text-sky-700">Click to view all verified tasks in progress</p>
                      </div>

                      {/* Complete (Green) */}
                      <div
                        onClick={() => setViewingTasksType("complete")}
                        className="group cursor-pointer rounded-3xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-xs hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-850">Complete</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm">✓</span>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold text-emerald-900 tracking-tight">{stats.totalCompleteTasks}</p>
                        <p className="mt-1 text-[10px] text-emerald-700">Click to view all completed and filed tasks</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          )}

          {/* TAB 2: ADD USER ONBOARDING */}
          {activeTab === "add-user" && (
            <section id="add-user" className="rounded-3xl border border-amber-200 bg-white p-6 shadow-md space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-stone-900">Onboard New Client</h2>
                <button
                  type="button"
                  onClick={() => dispatch(setActiveTab("registered-profiles"))}
                  className="rounded-xl border border-amber-200 bg-white hover:bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 transition shadow-xs"
                >
                  Back to Client Profiles
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleCreateUser}>
                {/* Onboarding fields grouped */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-name">Full Name</label>
                    <input
                      id="admin-user-name"
                      value={userForm.name}
                      onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white transition"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-email">Email ID</label>
                    <div className="flex gap-2">
                      <input
                        id="admin-user-email"
                        type="email"
                        value={userForm.email}
                        onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                        className="w-full flex-1 rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white disabled:bg-stone-100 disabled:text-stone-400 transition"
                        placeholder="e.g. john@example.com"
                        required
                        disabled={otpSent}
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || !userForm.email}
                        className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 whitespace-nowrap shadow-xs"
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
                          className="rounded-xl bg-stone-200 px-3 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-300 transition"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    {otpError && <p className="text-xs text-rose-600 font-semibold mt-1">{otpError}</p>}
                    {otpSent && !otpError && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">OTP sent to {otpSentEmail}.</p>
                    )}
                  </div>

                  {otpSent && (
                    <div className="grid gap-1">
                      <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-otp">Email OTP Code (6 digits)</label>
                      <input
                        id="admin-user-otp"
                        type="text"
                        pattern="\d{6}"
                        maxLength={6}
                        value={userForm.otp}
                        onChange={(event) => setUserForm((current) => ({ ...current, otp: event.target.value.replace(/\D/g, "") }))}
                        className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                        placeholder="Enter 6-digit OTP"
                        required
                      />
                    </div>
                  )}

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-mobile">Phone Number</label>
                    <input
                      id="admin-user-mobile"
                      type="tel"
                      value={userForm.mobileNumber}
                      onChange={(event) => {
                        const val = event.target.value.replace(/\D/g, "").slice(0, 10);
                        setUserForm((current) => ({ ...current, mobileNumber: val }));
                      }}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                      placeholder="e.g. 9999999999 (10 digits)"
                      required
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-pan">PAN Card Number</label>
                    <input
                      id="admin-user-pan"
                      value={userForm.panCard}
                      onChange={(event) => setUserForm((current) => ({ ...current, panCard: event.target.value.toUpperCase() }))}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                      placeholder="e.g. ABCDE1234F"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-aadhaar">Aadhaar Card </label>
                    <input
                      id="admin-user-aadhaar"
                      value={userForm.aadhaarCard}
                      onChange={(event) => {
                        setUserForm((current) => ({ ...current, aadhaarCard: event.target.value }));
                      }}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                      placeholder="e.g. 1234 5678 9012"
                      required
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-dob">Date of Birth</label>
                    <input
                      id="admin-user-dob"
                      type="text"
                      inputMode="numeric"
                      autoComplete="bday"
                      value={userForm.dob}
                      onChange={(event) => setUserForm((current) => ({ ...current, dob: formatDobInput(event.target.value) }))}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                      placeholder="DD/MM/YYYY"
                      pattern="\d{2}/\d{2}/\d{4}"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-gender">Gender</label>
                    <select
                      id="admin-user-gender"
                      value={userForm.gender}
                      onChange={(event) => setUserForm((current) => ({ ...current, gender: event.target.value }))}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-citizen">Citizenship</label>
                    <input
                      id="admin-user-citizen"
                      value={userForm.citizen}
                      onChange={(event) => setUserForm((current) => ({ ...current, citizen: event.target.value }))}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                      placeholder="e.g. Indian"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-residential-status">Residential Status</label>
                    <input
                      id="admin-user-residential-status"
                      value={userForm.residentialStatus}
                      onChange={(event) => setUserForm((current) => ({ ...current, residentialStatus: event.target.value }))}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                      placeholder="e.g. Resident"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-father-name">Father's Name</label>
                    <input
                      id="admin-user-father-name"
                      value={userForm.fatherName}
                      onChange={(event) => setUserForm((current) => ({ ...current, fatherName: event.target.value }))}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>

                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-stone-700" htmlFor="admin-user-firm">Firm Name (Optional)</label>
                    <input
                      id="admin-user-firm"
                      value={userForm.firmName}
                      onChange={(event) => setUserForm((current) => ({ ...current, firmName: event.target.value }))}
                      className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 outline-none focus:border-amber-500 focus:bg-white"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>

                  <PasswordInput
                    id="admin-user-password"
                    label="Account Password"
                    value={userForm.password}
                    onChange={(value) => setUserForm((current) => ({ ...current, password: value }))}
                    required
                    autoComplete="new-password"
                    className="grid gap-1"
                    labelClassName="text-xs font-semibold text-stone-700"
                    inputClassName="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 pr-20 outline-none focus:border-amber-500 focus:bg-white"
                    buttonClassName="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] font-semibold text-stone-600 transition hover:bg-amber-50"
                    placeholder="Enter Secure Password"
                  />

                  <PasswordInput
                    id="admin-user-confirm-password"
                    label="Confirm Password"
                    value={userForm.confirmPassword}
                    onChange={(value) => setUserForm((current) => ({ ...current, confirmPassword: value }))}
                    required
                    autoComplete="new-password"
                    className="grid gap-1"
                    labelClassName="text-xs font-semibold text-stone-700"
                    inputClassName="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-2.5 pr-20 outline-none focus:border-amber-500 focus:bg-white"
                    buttonClassName="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] font-semibold text-stone-600 transition hover:bg-amber-50"
                    placeholder="Retype Password"
                  />
                </div>

                {/* Services Taken Group */}
                <div className="grid gap-3 rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-xs">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Service Taken (Sidebar Accessibility Options)</h4>
                    <p className="text-[10px] text-stone-500">Tick the modules this client is allowed to access.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ADMIN_SERVICE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer hover:bg-white/60 p-1.5 rounded transition">
                        <input
                          type="checkbox"
                          checked={userForm.serviceAccess.includes(option.value)}
                          onChange={() => toggleService(option.value, "userForm")}
                          className="h-4 w-4 shrink-0 rounded border-amber-300 accent-amber-600 cursor-pointer"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Upload Past Year Section */}
                <div id="upload-past-year" className="grid gap-4 rounded-2xl border border-amber-200 bg-amber-50/20 p-5 shadow-xs">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Upload Past Year Documents</h4>
                    <p className="text-[10px] text-stone-500">Please queue all 4 files (ITR, Computation, P/L, Balance Sheet) before creating the profile.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {YEARLY_UPLOAD_CARD_META.map((card) => {
                      const draft = yearlyUploadDrafts[card.key];

                      return (
                        <div key={card.key} className="flex flex-col md:flex-row md:items-end justify-between gap-4 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm min-w-0 overflow-hidden">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-stone-850">{card.title}</p>
                              {draft.file && (
                                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                  Queued
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 leading-snug">{card.description}</p>
                          </div>

                          <div className="grid gap-1 w-full md:w-36 shrink-0">
                            <label className="text-[10px] font-bold text-stone-600" htmlFor={`${card.key}-year`}>
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
                              className="w-full rounded-lg border border-amber-200 bg-white px-2.5 py-2 text-xs outline-none focus:border-amber-500"
                            >
                              <option value="2023">2023-2024</option>
                              <option value="2024">2024-2025</option>
                              <option value="2025">2025-2026</option>
                              <option value="2026">2026-2027</option>
                            </select>
                          </div>

                          <div className="grid gap-1 w-full md:w-64 min-w-0 overflow-hidden shrink-0">
                            <label className="text-[10px] font-bold text-stone-600" htmlFor={`${card.key}-file`}>
                              Select PDF / Image File
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
                              className="w-full max-w-full overflow-hidden text-ellipsis rounded-lg border border-amber-200 bg-white p-1 text-xs outline-none focus:border-amber-500"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => queueYearlyUpload(card.key)}
                            disabled={!draft.file}
                            className="w-full md:w-auto shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 shadow-xs"
                          >
                            Add file
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {queuedYearlyUploads.length > 0 && (
                    <div className="grid gap-2 rounded-2xl border border-amber-200 bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">Queued Upload Files ({queuedYearlyUploads.length})</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {queuedYearlyUploads.map((item) => (
                          <span
                            key={item.id}
                            className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/50 pl-3 pr-2 py-1.5 text-xs font-semibold text-stone-800"
                          >
                            <span>
                              {getYearlyDocumentLabel(item.slot)} · FY {formatFinancialYear(Number(item.year))}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQueuedYearlyUpload(item.id)}
                              className="w-4 h-4 rounded-full flex items-center justify-center bg-amber-200 hover:bg-amber-300 text-stone-700 text-[9px] transition-colors"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Form submit footer */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-amber-200/50">
                  <p className="text-xs text-stone-500 leading-snug">
                    {!otpSent ? "Verification OTP must be successfully sent and verified to create a client." : "User details and document attachments will be persisted securely."}
                  </p>
                  <button
                    type="submit"
                    disabled={creatingUser || !otpSent || !userForm.otp || userForm.email.trim().toLowerCase() !== otpSentEmail.trim().toLowerCase()}
                    className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-750 hover:to-amber-800 px-6 py-3 font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                  >
                    {creatingUser ? "Processing Onboarding..." : "Onboard Client & Upload Files"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* TAB 3: SERVICES ASSIGNMENT */}
          {activeTab === "service-access" && (
            <section id="service-access" className="rounded-3xl border border-amber-200 bg-white p-6 shadow-md space-y-6 animate-fade-in">
              <div className="border-b border-amber-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-stone-900">Service Access Control</h2>
              </div>

              <form className="space-y-4" onSubmit={handleAssignServiceAccess}>
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-stone-700" htmlFor="service-access-email">Select Client Profile</label>
                  <input
                    id="service-access-email"
                    list="admin-profile-emails"
                    value={serviceEmail}
                    onChange={(event) => setServiceEmail(event.target.value)}
                    className="w-full rounded-xl border border-amber-200 bg-[#fffdfa] px-4 py-3 outline-none focus:border-amber-500"
                    placeholder="Type client email to search..."
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

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl border border-amber-100 p-4 bg-amber-50/10">
                  {ADMIN_SERVICE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer hover:bg-white/60 p-1.5 rounded transition">
                      <input
                        type="checkbox"
                        checked={serviceAccess.includes(option.value)}
                        onChange={() => toggleService(option.value, "serviceAccess")}
                        className="h-4 w-4 shrink-0 rounded border-amber-300 accent-amber-600 cursor-pointer"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={savingServiceAccess}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 px-6 py-3 text-xs font-bold text-white disabled:opacity-70 shadow transition"
                >
                  {savingServiceAccess ? "Saving Services..." : "Save Assigned Services"}
                </button>
              </form>
            </section>
          )}

          {/* TAB 4: CONSULTATION REQUESTS */}
          {activeTab === "consultation-requests" && (
            <section id="consultation-requests" className="rounded-3xl border border-amber-200 bg-white p-6 shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">Consultation Enquiries</h2>
                </div>
                <button type="button" onClick={() => loadData()} className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 transition">
                  Refresh List
                </button>
              </div>

              {loading ? (
                <p className="text-xs text-stone-500 py-12 text-center">Loading consultation requests...</p>
              ) : consultationRequests.length === 0 ? (
                <p className="text-xs text-stone-500 py-12 text-center">No consultation requests found.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-amber-100">
                  <table className="min-w-full divide-y divide-amber-100 text-xs">
                    <thead className="bg-[#fbfaf6]">
                      <tr className="text-left text-amber-800">
                        <th className="py-3 px-4 font-bold">Client Name</th>
                        <th className="py-3 px-4 font-bold">Email</th>
                        <th className="py-3 px-4 font-bold">Phone</th>
                        <th className="py-3 px-4 font-bold">Service Info</th>
                        <th className="py-3 px-4 font-bold">Enquiry Note</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-50 bg-white text-stone-700">
                      {consultationRequests.map((item) => (
                        <tr key={item.id} className="hover:bg-amber-50/10 transition-colors">
                          <td className="py-4 px-4 font-semibold text-stone-900">{item.fullName}</td>
                          <td className="py-4 px-4">{item.email}</td>
                          <td className="py-4 px-4">{item.phone}</td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-[10px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                              {item.serviceName}
                            </span>
                            {item.firmName && <p className="text-[10px] text-stone-400 mt-1">{item.firmName}</p>}
                          </td>
                          <td className="py-4 px-4 max-w-[200px] truncate" title={item.note || ""}>
                            {item.note || "-"}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={item.status}
                              onChange={(event) => updateStatus(item.id, event.target.value as ConsultationRequest["status"])}
                              className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs text-stone-800 font-semibold outline-none focus:border-amber-500 transition"
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 px-4 text-stone-500">{formatDisplayDate(item.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* TAB 5: REGISTERED PROFILES */}
          {activeTab === "registered-profiles" && (
            <section id="registered-profiles" className="rounded-3xl border border-amber-200 bg-white p-6 shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-stone-900">Client Profiles</h2>
                <button
                  type="button"
                  onClick={() => dispatch(setActiveTab("add-user"))}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600 text-[#f5efe4] hover:bg-amber-700 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md text-xl font-bold"
                  title="Onboard New Client"
                  aria-label="Onboard New Client"
                >
                  +
                </button>
              </div>

              {loading ? (
                <p className="text-xs text-stone-500 py-12 text-center">Loading client profiles...</p>
              ) : profiles.length === 0 ? (
                <p className="text-xs text-stone-500 py-12 text-center">No profiles found.</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-amber-100">
                  <table className="min-w-full divide-y divide-amber-100 text-xs">
                    <thead className="bg-[#fbfaf6]">
                      <tr className="text-left text-amber-800">
                        <th className="py-3 px-4 font-bold">Client Name</th>
                        <th className="py-3 px-4 font-bold">Email</th>
                        <th className="py-3 px-4 font-bold">Phone</th>
                        <th className="py-3 px-4 font-bold">Firm Name</th>
                        <th className="py-3 px-4 font-bold">Created On</th>
                        <th className="py-3 px-4 font-bold">Access Status</th>
                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-50 bg-white text-stone-700">
                      {profiles.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-amber-50/20 transition duration-150"
                        >
                          <td className="py-4 px-4 font-semibold text-stone-900">{item.fullName}</td>
                          <td className="py-4 px-4">{item.email}</td>
                          <td className="py-4 px-4">{item.phone}</td>
                          <td className="py-4 px-4">{item.firmName || "-"}</td>
                          <td className="py-4 px-4 text-stone-500">{formatDisplayDate(item.createdAt)}</td>
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
                              onClick={() => {
                                handleViewUserDocuments(item);
                                setModalServiceAccess(decodeServiceAccess(item.serviceAccess));
                              }}
                              className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap"
                            >
                              Manage Client
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

          {activeTab === "past-year-uploads" && (
            <section id="past-year-uploads" className="rounded-3xl border border-amber-200 bg-white p-6 shadow-md space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">Uploaded Yearly Documents</h2>
                </div>
                <button type="button" onClick={() => loadYearlyDocuments()} className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 transition">
                  Refresh List
                </button>
              </div>

              {loadingYearlyDocuments ? (
                <p className="text-xs text-stone-500 py-12 text-center">Loading documents...</p>
              ) : yearlyDocumentsError ? (
                <p className="text-xs text-rose-600 py-12 text-center">{yearlyDocumentsError}</p>
              ) : Object.keys(groupedYearlyDocs).length === 0 ? (
                <p className="text-xs text-stone-500 py-12 text-center">No yearly uploads found.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedYearlyDocs)
                    .sort((a, b) => Number(b[0]) - Number(a[0]))
                    .map(([yearKey, usersMap]) => {
                      const isExpanded = activeYearAccordion === yearKey;
                      const clientsCount = Object.keys(usersMap).length;

                      return (
                        <div key={yearKey} className="rounded-2xl border border-amber-200 overflow-hidden bg-white shadow-xs transition">
                          <button
                            type="button"
                            onClick={() => setActiveYearAccordion(isExpanded ? null : yearKey)}
                            className="w-full flex items-center justify-between p-4 bg-[#fbf9f4] hover:bg-amber-50/20 transition text-stone-900 font-semibold text-base border-b border-amber-100"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">📅</span>
                              <span className="font-serif">Financial Year {formatFinancialYear(Number(yearKey))}</span>
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                                {clientsCount} {clientsCount === 1 ? "Client" : "Clients"}
                              </span>
                            </div>
                            <span className="text-xs text-amber-800 font-bold">
                              {isExpanded ? "▲ Collapse" : "▼ Expand"}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="p-4 bg-white divide-y divide-amber-100">
                              {Object.entries(usersMap).map(([userId, clientData]) => (
                                <div key={userId} className="py-4 first:pt-0 last:pb-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                  {/* Client Info */}
                                  <div className="xl:w-1/4 min-w-0">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-stone-900 font-bold text-sm shrink-0">
                                        {clientData.userName.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="min-w-0">
                                        <h4 className="font-bold text-sm text-stone-850 truncate">{clientData.userName}</h4>
                                        <p className="text-xs text-stone-500 truncate">{clientData.userEmail}</p>
                                        {clientData.userPhone && (
                                          <p className="text-[10px] text-stone-400 mt-0.5">{clientData.userPhone}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    {(["itr", "computation", "pl", "bs"] as YearlyUploadCardKey[]).map((slotKey) => {
                                      const doc = clientData.docs[slotKey];
                                      const label = slotKey === "itr" ? "ITR" : slotKey === "computation" ? "Computation" : slotKey === "pl" ? "P/L Statement" : "Balance Sheet";

                                      if (doc) {
                                        return (
                                          <div key={slotKey} className="flex flex-col justify-between p-3 rounded-xl border border-amber-200 bg-[#faf8f4] hover:bg-amber-50/20 transition gap-2 min-w-0">
                                            <div className="min-w-0">
                                              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">{label}</p>
                                              <p className="text-xs font-semibold text-stone-900 mt-1 truncate" title={doc.fileName}>
                                                {doc.fileName}
                                              </p>
                                              <p className="text-[9px] text-stone-400 mt-0.5">
                                                Uploaded {formatDisplayDate(doc.createdAt)}
                                              </p>
                                            </div>
                                            {doc.signedUrl ? (
                                              <a
                                                href={doc.signedUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full text-center rounded-lg bg-amber-600 hover:bg-amber-700 py-1.5 text-xs font-bold text-white transition block mt-1 shadow-xs"
                                              >
                                                View File
                                              </a>
                                            ) : (
                                              <span className="w-full text-center text-[10px] font-medium text-rose-500 block py-1.5 mt-1">
                                                Link Unavailable
                                              </span>
                                            )}
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={slotKey} className="flex flex-col justify-center items-center p-4 rounded-xl border border-dashed border-amber-200 bg-stone-50 text-center gap-1">
                                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{label}</p>
                                            <span className="text-[9px] text-stone-400 italic mt-1">
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
        </main>
      </div>

      {/* Unified Client Details Modal */}
      {selectedUserForDocs && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1c160c]/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-6xl rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                  <span>Client Details:</span>
                  <span className="text-amber-800">{selectedUserForDocs.fullName}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {selectedUserForDocs.email} • {selectedUserForDocs.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForDocs(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 hover:bg-amber-200 text-stone-800 font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Split-pane Modal Content Layout */}
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              {/* Left Column: Profile Card & Service access editor */}
              <div className="space-y-6 lg:border-r lg:border-amber-100 lg:pr-6">
                {/* Profile Meta Info card */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/10 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-stone-900 text-lg font-bold">
                      {selectedUserForDocs.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm truncate max-w-[150px]">{selectedUserForDocs.fullName}</h4>
                      <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        selectedUserForDocs.userId
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {selectedUserForDocs.userId ? "Registered Client" : "Profile Only"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-stone-700 space-y-3 pt-2 border-t border-amber-100 max-h-[360px] overflow-y-auto pr-1">
                    <div className="grid gap-1">
                      <label className="font-bold text-[10px] uppercase text-stone-500">Full Name</label>
                      <input
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="font-bold text-[10px] uppercase text-stone-500">Email Address</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="font-bold text-[10px] uppercase text-stone-500">Phone Number</label>
                      <input
                        value={editPhone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setEditPhone(val);
                        }}
                        className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                        placeholder="10 digits only"
                        required
                      />
                    </div>
                    <div className="grid gap-1">
                      <label className="font-bold text-[10px] uppercase text-stone-500">Firm Name</label>
                      <input
                        value={editFirmName}
                        onChange={(e) => setEditFirmName(e.target.value)}
                        className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                        placeholder="Optional"
                      />
                    </div>
                    {selectedUserForDocs.userId && (
                      <>
                        <div className="grid gap-1">
                          <label className="font-bold text-[10px] uppercase text-stone-500">PAN Card</label>
                          <input
                            value={editPanCard}
                            onChange={(e) => setEditPanCard(e.target.value.toUpperCase())}
                            className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                            placeholder="e.g. ABCDE1234F"
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="font-bold text-[10px] uppercase text-stone-500">Aadhaar Card</label>
                          <input
                            value={editAadhaarCard}
                            onChange={(e) => setEditAadhaarCard(e.target.value)}
                            className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                            placeholder="e.g. 1234 5678 9012"
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="font-bold text-[10px] uppercase text-stone-500">Date of Birth</label>
                          <input
                            value={editDob}
                            onChange={(e) => setEditDob(formatDobInput(e.target.value))}
                            className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                            placeholder="DD/MM/YYYY"
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="font-bold text-[10px] uppercase text-stone-500">Gender</label>
                          <select
                            value={editGender}
                            onChange={(e) => setEditGender(e.target.value)}
                            className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="grid gap-1">
                          <label className="font-bold text-[10px] uppercase text-stone-500">Citizenship</label>
                          <input
                            value={editCitizen}
                            onChange={(e) => setEditCitizen(e.target.value)}
                            className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                            placeholder="e.g. Indian"
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="font-bold text-[10px] uppercase text-stone-500">Residential Status</label>
                          <input
                            value={editResidentialStatus}
                            onChange={(e) => setEditResidentialStatus(e.target.value)}
                            className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                            placeholder="e.g. Resident"
                          />
                        </div>
                        {selectedUserForDocs.passwordPlain && (
                          <div className="grid gap-1">
                            <label className="font-bold text-[10px] uppercase text-stone-500">
                              Current Password: <span className="font-mono select-all bg-stone-100 px-1 py-0.5 rounded border border-stone-200">{selectedUserForDocs.passwordPlain}</span>
                            </label>
                          </div>
                        )}
                        <div className="grid gap-1">
                          <label className="font-bold text-[10px] uppercase text-stone-500">Change Password</label>
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-500"
                            placeholder="Type new password"
                          />
                        </div>
                      </>
                    )}
                    <p className="pt-1 text-[10px] text-stone-400"><strong>Created On:</strong> {formatDisplayDate(selectedUserForDocs.createdAt)}</p>
                  </div>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSaveClientInfo}
                      disabled={savingClientInfo || !editFullName || !editEmail || editPhone.length !== 10}
                      className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 shadow-xs"
                    >
                      {savingClientInfo ? "Saving Info..." : "Save Client Info"}
                    </button>
                  </div>
                </div>

                {/* Services Assignment Block */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-1">
                    <h4 className="font-bold text-[10px] uppercase tracking-wider text-amber-800">
                      Services Scope
                    </h4>
                  </div>
                  {selectedUserForDocs.userId ? (
                    <div className="space-y-4">
                      <div className="max-h-[240px] overflow-y-auto rounded-xl border border-amber-200 p-3 bg-stone-50 space-y-1">
                        {ADMIN_SERVICE_OPTIONS.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer hover:bg-amber-100/40 p-1.5 rounded transition">
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
                              className="h-4 w-4 shrink-0 rounded border-amber-300 accent-amber-600 cursor-pointer"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveModalServiceAccess}
                        disabled={savingModalServiceAccess}
                        className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 shadow-xs"
                      >
                        {savingModalServiceAccess ? "Saving Scope..." : "Save Service Scope"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 p-3 rounded-xl leading-relaxed text-justify">
                      This user has not registered a login account password yet. Onboard them via the Onboarding tab first.
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                {loadingUserDocs ? (
                  <p className="text-center text-xs text-stone-500 py-12">Loading client documents...</p>
                ) : userDocsError ? (
                  <p className="text-center text-xs text-rose-600 py-12">{userDocsError}</p>
                ) : userDocuments.length === 0 ? (
                  <p className="text-center text-xs text-stone-500 py-12">No documents uploaded by this user yet.</p>
                ) : (
                  <div className="space-y-6">
                    {/* General Documents List */}
                    {(() => {
                      const personal = userDocuments.filter(d => !d.documentType.startsWith("service:") && !d.documentYear && !d.documentSlot);
                      if (personal.length === 0) return null;
                      return (
                        <div className="space-y-3">
                          <h4 className="font-bold text-[10px] uppercase tracking-wider text-amber-800 border-b border-amber-100 pb-1">Personal & General Documents</h4>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {personal.map(doc => renderDocCard(doc))}
                          </div>
                        </div>
                      );
                    })()}
                    {(() => {
                      const yearly = userDocuments.filter(d => d.documentYear && d.documentSlot);
                      if (yearly.length === 0) return null;
                      return (
                        <div className="space-y-3">
                          <h4 className="font-bold text-[10px] uppercase tracking-wider text-amber-800 border-b border-amber-100 pb-1">Yearly Documents</h4>
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
                          <h4 className="font-bold text-[10px] uppercase tracking-wider text-amber-800 border-b border-amber-100 pb-1">Service Uploads</h4>
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

      {/* Grouped Service Documents Modal — above other dashboard overlays */}
      {viewingServiceDocumentsUserId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#1c160c]/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-4xl rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-stone-900">All Service Documents</h3>
                <p className="text-xs text-stone-500 mt-1">{viewingServiceDocumentsUserName}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingServiceDocumentsUserId(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 hover:bg-amber-200 text-stone-850 font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {loadingServiceDocuments ? (
              <p className="text-center text-xs text-stone-500 py-12">Loading documents...</p>
            ) : serviceDocumentsData.length === 0 ? (
              <p className="text-center text-xs text-stone-500 py-12">No service documents found for this user.</p>
            ) : (
              <div className="space-y-4">
                {serviceDocumentsData.map((group) => {
                  const serviceLabel = group.documentType.replace("service:", "").replace(/-/g, " ").toUpperCase();
                  return (
                    <div key={group.documentType} className="rounded-2xl border border-amber-100 overflow-hidden">
                      {/* Group Header */}
                      <div className="bg-[#fbfaf6] px-4 py-3 border-b border-amber-100">
                        <p className="text-sm font-bold text-amber-900">📁 {serviceLabel}</p>
                        <p className="text-xs text-amber-700 mt-1">{group.documents.length} document{group.documents.length !== 1 ? "s" : ""}</p>
                      </div>
                      {/* Documents in Group */}
                      <div className="divide-y divide-amber-50">
                        {group.documents.map((doc: any) => (
                          <div key={doc.id} className="p-4 hover:bg-amber-50/30 transition">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-stone-900 truncate">{doc.fileName}</p>
                                <p className="text-xs text-stone-500 mt-1">Uploaded: {formatDisplayDate(doc.createdAt)}</p>
                                {doc.uploadDescription && doc.uploadDescription !== doc.fileName && (
                                  <p className="text-xs text-stone-600 mt-2 italic">Notes: {doc.uploadDescription}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {doc.signedUrl && (
                                  <a
                                    href={doc.signedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 text-xs font-semibold transition"
                                  >
                                    View
                                  </a>
                                )}
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${
                                  doc.uploadStatus === "completed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : doc.uploadStatus === "verified"
                                    ? "bg-sky-100 text-sky-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}>
                                  {doc.uploadStatus === "completed"
                                    ? "Completed"
                                    : doc.uploadStatus === "verified"
                                    ? "Verified"
                                    : "Uploaded"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Due/WIP/Complete Tasks Modal */}
      {viewingTasksType && stats && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1c160c]/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-5xl rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-amber-100 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                  <span>
                    {viewingTasksType === "due" && "⚠️"}
                    {viewingTasksType === "wip" && "⚙️"}
                    {viewingTasksType === "complete" && "✓"}
                  </span>{" "}
                  {viewingTasksType === "due" && `Active Due Tasks (${stats.totalDueTasks})`}
                  {viewingTasksType === "wip" && `Work In Progress Tasks (${stats.totalWipTasks})`}
                  {viewingTasksType === "complete" && `Completed Tasks (${stats.totalCompleteTasks})`}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {viewingTasksType === "due" && "List of all pending service requests and files uploaded by users that require attention."}
                  {viewingTasksType === "wip" && "List of all verified tasks that are currently being processed."}
                  {viewingTasksType === "complete" && "List of all service tasks and return filings that are complete."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingTasksType(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 hover:bg-amber-200 text-stone-850 font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {(viewingTasksType === "due" ? stats.dueTasksList : viewingTasksType === "wip" ? stats.wipTasksList : stats.completeTasksList).length === 0 ? (
              <p className="text-center text-xs text-stone-500 py-12">No tasks in this category at the moment.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-amber-100">
                <table className="min-w-full divide-y divide-amber-100 text-xs">
                  <thead className="bg-[#fbfaf6]">
                    <tr className="text-left text-amber-800">
                      <th className="py-3 px-4 font-semibold">User Details</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold">Service Name</th>
                      <th className="py-3 px-4 font-semibold">Details</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Action / Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-50 bg-white text-stone-750">
                    {(viewingTasksType === "due" ? stats.dueTasksList : viewingTasksType === "wip" ? stats.wipTasksList : stats.completeTasksList).map((task) => (
                      <tr key={task.id} className="hover:bg-amber-50/10 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-stone-900">{task.userName}</p>
                          <p className="text-[10px] text-stone-500 mt-0.5">{task.userEmail}</p>
                          <p className="text-[10px] text-stone-500 mt-0.5">{task.userPhone || "-"}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            task.type === "document"
                              ? "bg-sky-100 text-sky-850"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {task.type === "document" ? "File Upload" : "Service Taken"}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-semibold">
                          {task.type === "document"
                            ? getDocTypeLabel({ documentType: task.documentType, documentSlot: task.financialYear, documentYear: task.documentYear })
                            : task.serviceName}
                        </td>
                        <td className="py-4 px-4 max-w-[200px] truncate">
                          {task.type === "document" ? (
                            <div>
                              <p className="text-[10px] font-bold text-stone-500">File:</p>
                              <p className="text-xs break-all" title={task.fileName}>{task.fileName}</p>
                              {task.financialYear && (
                                <p className="text-[9px] text-amber-800 font-bold bg-amber-50 rounded px-1.5 py-0.5 inline-block mt-1">
                                  FY {task.financialYear}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p className="text-[10px] font-bold text-stone-500">Note:</p>
                              <p className="text-xs whitespace-pre-wrap line-clamp-2" title={task.note || ""}>
                                {task.note || "-"}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-stone-500">
                          {formatDisplayDate(task.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                          {task.type === "document" ? (
                            <div className="flex gap-2 items-center justify-end">
                              {task.userId && (
                                <button
                                  type="button"
                                  onClick={() => loadServiceDocumentsForUser(task.userId as string, task.userName || "User")}
                                  className="rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 px-2.5 py-1.5 text-xs font-semibold transition"
                                >
                                  View Docs
                                </button>
                              )}
                              <select
                                value={task.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  dispatch(updateTaskStatus({
                                    taskId: task.id,
                                    type: "document",
                                    newStatus,
                                  }));
                                  try {
                                    const response = await fetch("/api/admin/documents", {
                                      method: "PATCH",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ documentId: task.id, uploadStatus: newStatus }),
                                    });
                                    if (!response.ok) throw new Error("Failed to update status");
                                    await loadStats(true);
                                  } catch (err) {
                                    toast?.error("Failed to update status");
                                    await loadStats(false);
                                  }
                                }}
                                className="rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-amber-500 font-medium"
                              >
                                <option value="uploaded">Uploaded (Due)</option>
                                <option value="verified">Verified (WIP)</option>
                                <option value="completed">Completed (ITR Filed)</option>
                              </select>
                            </div>
                          ) : (
                              <select
                                value={task.status}
                                onChange={async (e) => {
                                  const newStatus = e.target.value as ConsultationRequest["status"];
                                  dispatch(updateTaskStatus({
                                    taskId: task.id,
                                    type: "consultation",
                                    newStatus,
                                  }));
                                  try {
                                    await updateStatus(task.id, newStatus, true);
                                  } catch (err) {
                                    toast?.error("Failed to update status");
                                    await loadStats(false);
                                  }
                                }}
                                className="rounded-lg border border-amber-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-amber-500 font-medium"
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
