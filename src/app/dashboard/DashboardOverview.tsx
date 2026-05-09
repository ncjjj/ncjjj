'use client';

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useServiceRequestsRealtime } from "../../hooks/useServiceRequestsRealtime";

function getPaymentLabel(status: string | null | undefined): string {
  if (status === "received") {
    return "successful";
  }

  return "pending";
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const { requests, previewByRequest, stats, loading, error } = useServiceRequestsRealtime();

  const latestRequest = requests[0] ?? null;
  const latestPreview = latestRequest ? previewByRequest[latestRequest.id] : null;
  const completedCases = stats.approved;
  const successfulPayments = requests.filter((request) => request.paymentStatus === "received").length;

  return (
    <div className="dashboard-page dashboard-overview flex flex-col min-h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl shadow-2xl overflow-hidden border border-[#e8dcc0] bg-white/80 backdrop-blur-md">
            <div className="h-28 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

            <div className="dashboard-page-body p-8 space-y-8">
              <div className="dashboard-page-header flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#3b2f1c]">
                    Dashboard Overview
                  </h2>
                  <p className="text-sm text-[#7a6a4f]">
                    Welcome, {userName}. Your service metrics are synced live with admin updates.
                  </p>
                </div>

                <Link
                  href="/services"
                  className="dashboard-overview-action px-5 py-2 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] hover:bg-[#f5e6c8] text-sm"
                >
                  Explore Services
                </Link>
              </div>

              {error ? (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              {loading ? (
                <p className="rounded-lg border border-[#e8dcc0] bg-[#fffaf0] px-4 py-3 text-sm text-[#6b5b3e]">
                  Syncing your latest service activity...
                </p>
              ) : null}

              <div className="dashboard-stat-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  {
                    title: "Active Consultations",
                    value: stats.total,
                    helper: stats.total > 0 ? "Includes all tracked service requests" : "No records yet",
                  },
                  {
                    title: "Pending Requests",
                    value: stats.pending,
                    helper: stats.pending > 0 ? "Waiting for admin action" : "No pending requests",
                  },
                  {
                    title: "Completed Cases",
                    value: completedCases,
                    helper: completedCases > 0 ? "Approved by admin" : "No completed cases yet",
                  },
                  {
                    title: "Successful Payments",
                    value: successfulPayments,
                    helper:
                      successfulPayments > 0
                        ? "Payment status marked successful"
                        : "No successful payments yet",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="dashboard-stat-card p-5 rounded-2xl bg-[#faf6ed] border border-[#e8dcc0] hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <p className="text-sm text-[#7a6a4f]">{card.title}</p>
                    <h3 className="text-[1.7rem] font-bold text-[#3b2f1c] mt-1 leading-none">
                      {card.value}
                    </h3>
                    <p className="text-xs text-[#8a7a60] mt-1">{card.helper}</p>
                  </div>
                ))}
              </div>

              <div className="dashboard-start-card bg-white p-5 rounded-2xl border border-[#e8dcc0] shadow-sm">
                <h3 className="text-lg font-semibold text-[#3b2f1c] mb-4">
                  Live Service Snapshot
                </h3>

                <div className="space-y-3 text-sm text-[#6b5b3e]">
                  {latestRequest ? (
                    <>
                      <p>
                        Latest Service: <span className="font-medium text-[#3b2f1c]">{latestRequest.serviceName}</span>
                      </p>
                      <p>
                        Status: <span className="font-medium text-[#3b2f1c]">{latestPreview?.status ?? latestRequest.status}</span>
                      </p>
                      <p>
                        Admin Note: {(latestPreview?.adminRemarks ?? latestRequest.adminRemarks) || "No remarks yet"}
                      </p>
                      <p>
                        Payment: {getPaymentLabel(latestPreview?.paymentStatus ?? latestRequest.paymentStatus)}
                      </p>
                      {latestPreview ? <p>Live Preview: Admin is editing this request before saving.</p> : null}
                    </>
                  ) : (
                    <>
                      <p>No service requests found yet.</p>
                      <p>Your activity will appear here once you submit a service request.</p>
                    </>
                  )}
                  <div className="dashboard-overview-actions flex flex-wrap gap-3 pt-1">
                    <Link
                      href="/dashboard/consultations"
                      className="px-4 py-2 rounded-lg bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
                    >
                      Open My Services
                    </Link>
                    <Link
                      href="/services"
                      className="px-4 py-2 rounded-lg bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
                    >
                      Explore Services
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
