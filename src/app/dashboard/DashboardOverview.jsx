'use client';

import React from "react";

import TopNavbar from "./components/TopNavbar";

const stats = [
  { title: "Active Consultations", value: 12 },
  { title: "Pending Requests", value: 5 },
  { title: "Completed Cases", value: 30 },
  { title: "Total Payments", value: "$12,000" },
];

export default function DashboardOverview() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {/* CENTER CONTAINER */}
        <div className="max-w-6xl mx-auto">
          {/* OUTER CARD */}
          <div className="rounded-3xl shadow-2xl overflow-hidden border border-[#e8dcc0] bg-white/80 backdrop-blur-md">
            {/* GOLD HEADER */}
            <div className="h-28 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

            {/* CONTENT */}
            <div className="p-8 space-y-8">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-[#3b2f1c]">
                    Dashboard Overview
                  </h2>
                  <p className="text-sm text-[#7a6a4f] mt-1">
                    Track your activity and performance
                  </p>
                </div>

                <button className="px-5 py-2 rounded-xl border border-[#e5d7b6] bg-[#faf6ed] hover:bg-[#f5e6c8] text-sm">
                  View Reports
                </button>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-[#faf6ed] border border-[#e8dcc0] hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <p className="text-sm text-[#7a6a4f]">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-[#3b2f1c] mt-2">
                      {stat.value}
                    </h3>
                  </div>
                ))}
              </div>

              {/* INNER CARD */}
              <div className="bg-white p-6 rounded-2xl border border-[#e8dcc0] shadow-sm">
                <h3 className="text-lg font-semibold text-[#3b2f1c] mb-6">
                  Activity Overview
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT */}
                  <div className="space-y-4 text-sm text-[#6b5b3e]">
                    <div className="flex justify-between">
                      <span>Consultation Completed</span>
                      <span className="text-green-600 font-medium">✔ Done</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Document Verification</span>
                      <span className="text-yellow-600 font-medium">Pending</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Received</span>
                      <span className="text-[#b89b5e] font-medium">$2000</span>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="space-y-4 text-sm text-[#6b5b3e]">
                    <div>
                      <p className="font-medium">Upcoming Meeting</p>
                      <p className="text-xs">Today • 3:00 PM</p>
                    </div>
                    <div>
                      <p className="font-medium">Next Consultation</p>
                      <p className="text-xs">Tomorrow • 11:00 AM</p>
                    </div>
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