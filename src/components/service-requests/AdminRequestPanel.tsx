"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserSocketClient } from "../../lib/socketClient";
import type {
  AdminDocumentUserGroup,
  
  ConsultantRegistrationView,
  PaymentStatus,
  ServiceRequestStatus,
  ServiceRequestView,
} from "../../types/domain";

type User = {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role?: string;
  createdAt?: string;
};

type AdminDashboardPayload = {
  users?: User[];
  requests?: ServiceRequestView[];
  consultantRegistrations?: ConsultantRegistrationView[];
  
  documentGroups?: AdminDocumentUserGroup[];
  message?: string;
};

const serviceStatusStyles: Record<ServiceRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: "bg-slate-100 text-slate-700",
  received: "bg-emerald-100 text-emerald-800",
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

export default function AdminRequestPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<ServiceRequestView[]>([]);
  const [consultantRegistrations, setConsultantRegistrations] = useState<ConsultantRegistrationView[]>([]);
  
  const [documentGroups, setDocumentGroups] = useState<AdminDocumentUserGroup[]>([]);
  const [userFilter, setUserFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (mode: "initial" | "sync" = "sync") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setSyncing(true);
    }

    try {
      const response = await fetch("/api/admin/update-status", { cache: "no-store" });
      const payload = (await response.json()) as AdminDashboardPayload;

      if (!response.ok) {
        throw new Error(payload.message || "Unable to load admin dashboard.");
      }

      setUsers(payload.users || []);
      setRequests(payload.requests || []);
      setConsultantRegistrations(payload.consultantRegistrations || []);
      
      setDocumentGroups(payload.documentGroups || []);
      setError("");
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, "Unable to load admin dashboard."));
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard("initial");
  }, [loadDashboard]);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    async function setupSocket() {
      const socket = await getUserSocketClient();

      if (!socket || disposed) {
        return;
      }

      const reload = () => {
        void loadDashboard("sync");
      };

      socket.on("connect", reload);
      socket.on("serviceRequestCreated", reload);
      socket.on("serviceUpdated", reload);
      socket.on("adminNoteAdded", reload);
      socket.on("documentsUpdated", reload);
      socket.on("consultantRegistered", reload);
      socket.on("consultantStatusUpdated", reload);

      if (socket.connected) {
        reload();
      }

      cleanup = () => {
        socket.off("connect", reload);
        socket.off("serviceRequestCreated", reload);
        socket.off("serviceUpdated", reload);
        socket.off("adminNoteAdded", reload);
        socket.off("documentsUpdated", reload);
        socket.off("consultantRegistered", reload);
        socket.off("consultantStatusUpdated", reload);
      };
    }

    setupSocket();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [loadDashboard]);

  const filteredUsers = useMemo(() => {
    const term = userFilter.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.mobileNumber, user.role || ""]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [users, userFilter]);

  const stats = useMemo(() => {
    return {
      users: users.length,
      requests: requests.length,
      pendingRequests: requests.filter((request) => request.status === "pending").length,
      documents: documentGroups.reduce((total, group) => total + group.documents.length, 0),
      pendingConsultants: consultantRegistrations.filter((item) => item.status === "pending").length,
    };
  }, [consultantRegistrations, documentGroups, requests, users]);

  const postAdminUpdate = async (body: Record<string, unknown>, successMessage: string, key: string) => {
    setActionKey(key);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Unable to save admin update.");
      }

      setMessage(successMessage);
      await loadDashboard("sync");
    } catch (updateError: unknown) {
      setError(getErrorMessage(updateError, "Unable to save admin update."));
    } finally {
      setActionKey("");
    }
  };

  const updateRequestStatus = (
    request: ServiceRequestView,
    status: Exclude<ServiceRequestStatus, "pending">
  ) => {
    void postAdminUpdate(
      {
        requestId: request.id,
        status,
        remarks: status === "approved" ? "Approved by admin" : "Rejected by admin",
      },
      `Service request ${status}.`,
      `request-${request.id}-${status}`
    );
  };

  const updatePayment = (request: ServiceRequestView, paymentStatus: PaymentStatus) => {
    void postAdminUpdate(
      {
        requestId: request.id,
        paymentStatus,
        paymentNote: paymentStatus === "received" ? "Payment received" : "Payment pending",
      },
      "Payment status updated.",
      `payment-${request.id}-${paymentStatus}`
    );
  };

  const updateConsultant = (
    item: ConsultantRegistrationView,
    status: "approved" | "rejected"
  ) => {
    void postAdminUpdate(
      {
        consultantRegistrationId: item.id,
        status,
      },
      `Consultant request ${status}.`,
      `consultant-${item.id}-${status}`
    );
  };

  

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Admin Dashboard</h1>
          <p className="text-sm text-[#4b5563]">
            Users, requests, and documents stay synced from one admin feed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDashboard("sync")}
          disabled={syncing || loading}
          className="rounded-lg border border-[#111827] bg-white px-4 py-2 text-sm font-medium text-[#111827] disabled:opacity-60"
        >
          {syncing ? "Syncing..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Users", stats.users],
          ["Requests", stats.requests],
          ["Pending Requests", stats.pendingRequests],
          ["Documents", stats.documents],
          ["Consultants", stats.pendingConsultants],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-[#d1d5db] bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#111827]">{value}</p>
          </div>
        ))}
      </div>

      {loading ? <p className="text-sm text-[#4b5563]">Loading admin data...</p> : null}

      <section className="mb-6 rounded-xl border border-[#d1d5db] bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">Service Requests</h2>
            <p className="text-sm text-[#6b7280]">Approve/reject requests and keep payment state current.</p>
          </div>
        </div>

        <div className="space-y-4">
          {requests.length === 0 && !loading ? (
            <p className="rounded-lg border border-dashed border-[#d1d5db] p-4 text-sm text-[#6b7280]">
              No service requests yet.
            </p>
          ) : null}

          {requests.map((request) => (
            <article key={request.id} className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold text-[#111827]">{request.serviceName || request.serviceId}</h3>
                  <p className="text-xs text-[#6b7280]">
                    {request.userName} - {request.userPhone} - {formatDate(request.createdAt)}
                  </p>
                  <p className="mt-2 text-xs text-[#4b5563]">
                    PAN: {request.pan || "-"} - Aadhaar: {request.aadhaar || "-"} - GST: {request.gstNumber || "-"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${serviceStatusStyles[request.status]}`}>
                    {request.status}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatusStyles[request.paymentStatus || "pending"]}`}>
                    Payment {request.paymentStatus || "pending"}
                  </span>
                </div>
              </div>

              {request.documents.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {request.documents.map((document) =>
                    document.signedUrl ? (
                      <a
                        key={document.id}
                        href={document.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 text-xs text-[#111827]"
                      >
                        {document.type}
                      </a>
                    ) : (
                      <span key={document.id} className="rounded-lg border border-[#d1d5db] bg-white px-3 py-1.5 text-xs text-[#6b7280]">
                        {document.type}
                      </span>
                    )
                  )}
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={request.status !== "pending" || Boolean(actionKey)}
                  onClick={() => updateRequestStatus(request, "approved")}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={request.status !== "pending" || Boolean(actionKey)}
                  onClick={() => updateRequestStatus(request, "rejected")}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={Boolean(actionKey)}
                  onClick={() => updatePayment(request, request.paymentStatus === "received" ? "pending" : "received")}
                  className="rounded-lg border border-[#111827] bg-white px-3 py-2 text-xs font-medium text-[#111827] disabled:opacity-50"
                >
                  Mark Payment {request.paymentStatus === "received" ? "Pending" : "Received"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-[#d1d5db] bg-white p-4">
          <h2 className="text-lg font-semibold text-[#111827]">Registered Users ({users.length})</h2>
          <div className="mt-3 flex items-center gap-3">
            <input
              value={userFilter}
              onChange={(event) => setUserFilter(event.target.value)}
              placeholder="Search users by name, email or mobile"
              className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setUserFilter("")}
              className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm"
            >
              Clear
            </button>
          </div>

          <div className="mt-3 max-h-[480px] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-[#6b7280]">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Mobile</th>
                  <th className="px-2 py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/admin/users/${user.id}/documents`)}
                    className="cursor-pointer border-t border-[#e5e7eb] text-[#1f2937] hover:bg-[#f9fafb]"
                  >
                    <td className="px-2 py-2">{user.name}</td>
                    <td className="px-2 py-2">{user.email}</td>
                    <td className="px-2 py-2">{user.mobileNumber}</td>
                    <td className="px-2 py-2 capitalize">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[#d1d5db] bg-white p-4">
          <h2 className="text-lg font-semibold text-[#111827]">Document Groups</h2>
          <div className="mt-3 max-h-[480px] space-y-3 overflow-auto">
            {documentGroups.length === 0 && !loading ? (
              <p className="rounded-lg border border-dashed border-[#d1d5db] p-4 text-sm text-[#6b7280]">
                No uploaded documents yet.
              </p>
            ) : null}
            {documentGroups.map((group) => (
              <article key={group.userId} className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#111827]">{group.userName}</p>
                    <p className="text-xs text-[#6b7280]">{group.userEmail}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/users/${group.userId}/documents`)}
                    className="rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    View
                  </button>
                </div>
                <p className="mt-2 text-xs text-[#4b5563]">
                  {group.documents.length} document(s), {group.documents.filter((doc) => doc.documentCategory === "permanent").length} permanent
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-[#d1d5db] bg-white p-4">
          <h2 className="text-lg font-semibold text-[#111827]">Consultant Requests</h2>
          <div className="mt-3 space-y-3">
            {consultantRegistrations.slice(0, 8).map((item) => (
              <article key={item.id} className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#111827]">{item.userName}</p>
                    <p className="text-xs text-[#6b7280]">{item.consultantName || "Consultant request"} - {formatDate(item.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{item.status}</span>
                </div>
                {item.status === "pending" ? (
                  <div className="mt-3 flex gap-2">
                    <button type="button" disabled={Boolean(actionKey)} onClick={() => updateConsultant(item, "approved")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs text-white disabled:opacity-50">
                      Approve
                    </button>
                    <button type="button" disabled={Boolean(actionKey)} onClick={() => updateConsultant(item, "rejected")} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs text-white disabled:opacity-50">
                      Reject
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        
      </div>
    </div>
  );
}
