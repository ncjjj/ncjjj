"use client";

import { useServiceRequestsRealtime } from "../../hooks/useServiceRequestsRealtime";
import type {
  ServiceRequestStatus,
} from "../../types/domain";

const statusStyles: Record<ServiceRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
};

function getPaymentLabel(status: string | null | undefined): string {
  if (status === "received") {
    return "successful";
  }

  return "pending";
}

export default function UserRequestDashboard() {
  const { requests, previewByRequest, stats, loading, error } = useServiceRequestsRealtime();

  return (
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-6xl rounded-3xl border border-[#e8dcc0] bg-white/85 p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">My Service Requests</h2>
            <p className="text-sm text-[#7a6a4f]">Track verification status, remarks and payment state</p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Total", stats.total],
            ["Pending", stats.pending],
            ["Approved", stats.approved],
            ["Rejected", stats.rejected],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-[#e8dcc0] bg-[#faf6ed] p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-[#7a6a4f]">{label}</p>
              <p className="mt-2 text-2xl font-bold text-[#3b2f1c]">{value}</p>
            </div>
          ))}
        </div>

        {loading ? <p className="text-sm text-[#6b5b3e]">Loading requests...</p> : null}
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        {!loading && requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d9c9a4] bg-[#fffaf0] p-8 text-center text-[#6b5b3e]">
            No service requests found yet.
          </div>
        ) : null}

        <div className="space-y-5">
          {requests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-[#e8dcc0] bg-white p-5">
              {previewByRequest[request.id] ? (
                <div className="mb-4 rounded-2xl border border-[#c0841a] bg-[#fff4db] px-4 py-3 text-sm text-[#7c4a03]">
                  Admin is previewing an update for this request. It is visible live here, but not saved yet.
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#3b2f1c]">{request.serviceName}</h3>
                  <p className="text-xs text-[#7a6a4f]">Request ID: {request.id}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[previewByRequest[request.id]?.status ?? request.status] || statusStyles.pending
                  }`}
                >
                  {previewByRequest[request.id]?.status ?? request.status}
                </span>
              </div>

              <div className="mt-4 grid gap-4 text-sm text-[#5a5040] md:grid-cols-2">
                <p>
                  Admin Remarks: {(previewByRequest[request.id]?.adminRemarks ?? request.adminRemarks) || "No remarks yet"}
                </p>
                <p>
                  Payment Status: {getPaymentLabel(previewByRequest[request.id]?.paymentStatus ?? request.paymentStatus)}
                </p>
              </div>

              {request.documents?.length ? (
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  {request.documents.map((doc) => (
                    doc.signedUrl ? (
                      <a
                        key={doc.id}
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-[#e8dcc0] bg-[#faf6ed] px-3 py-2 text-[#3b2f1c] hover:bg-[#f5e6c8]"
                      >
                        {doc.type}
                      </a>
                    ) : (
                      <span
                        key={doc.id}
                        className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-500"
                      >
                        {doc.type}
                      </span>
                    )
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
