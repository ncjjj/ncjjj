'use client';

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl shadow-2xl overflow-hidden border border-[#e8dcc0] bg-white/80 backdrop-blur-md">
            <div className="h-28 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[#3b2f1c]">
                    Dashboard Overview
                  </h2>
                  <p className="text-sm text-[#7a6a4f] mt-1">
                    Welcome, {userName}. Your dashboard data will appear once you start using services.
                  </p>
                </div>

                <Link
                  href="/services"
                  className="px-5 py-2 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] hover:bg-[#f5e6c8] text-sm"
                >
                  Explore Services
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  "Active Consultations",
                  "Pending Requests",
                  "Completed Cases",
                  "Total Payments",
                ].map((title) => (
                  <div
                    key={title}
                    className="p-6 rounded-2xl bg-[#faf6ed] border border-[#e8dcc0] hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <p className="text-sm text-[#7a6a4f]">{title}</p>
                    <h3 className="text-2xl font-bold text-[#3b2f1c] mt-2">
                      0
                    </h3>
                    <p className="text-xs text-[#8a7a60] mt-2">No records yet</p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#e8dcc0] shadow-sm">
                <h3 className="text-lg font-semibold text-[#3b2f1c] mb-6">
                  Getting Started
                </h3>

                <div className="space-y-4 text-sm text-[#6b5b3e]">
                  <p>No predefined dashboard data is shown.</p>
                  <p>Your real activity will appear after you book a consultation, upload documents, or create support requests.</p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href="/dashboard/book-appointment"
                      className="px-4 py-2 rounded-lg bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
                    >
                      Book Appointment
                    </Link>
                    <Link
                      href="/dashboard/documents"
                      className="px-4 py-2 rounded-lg bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0] transition"
                    >
                      Upload Document
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