'use client';

import React from "react";

const consultations = [
  {
    id: 1,
    consultant: "John Doe",
    date: "April 15, 2026",
    time: "10:00 AM",
    status: "Active",
  },
  {
    id: 2,
    consultant: "Jane Smith",
    date: "April 16, 2026",
    time: "2:00 PM",
    status: "Pending",
  },
  {
    id: 3,
    consultant: "Michael Brown",
    date: "April 10, 2026",
    time: "11:00 AM",
    status: "Completed",
  },
];

const statusStyles = {
  Active: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Completed: "bg-gray-100 text-gray-600",
};

export default function MyConsultations() {
  return (
    <div className="flex justify-center mt-10">

      {/* MAIN CARD */}
      <div className="w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden border border-[#e8dcc0] bg-white/80 backdrop-blur-md">

        {/* GOLD HEADER */}
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

        {/* CONTENT */}
        <div className="p-8 space-y-8">

          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">
              My Consultations
            </h2>
            <p className="text-sm text-[#7a6a4f] mt-1">
              Track and manage your consultations
            </p>
          </div>

          {/* SUMMARY STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Active", "Pending", "Completed", "Total"].map((type, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#faf6ed] border border-[#e8dcc0] text-center"
              >
                <p className="text-xs text-[#7a6a4f]">{type}</p>
                <p className="text-lg font-bold text-[#3b2f1c] mt-1">
                  {type === "Total"
                    ? consultations.length
                    : consultations.filter(c => c.status === type).length}
                </p>
              </div>
            ))}
          </div>

          {/* CONSULTATION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {consultations.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-3xl border border-[#e8dcc0] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
              >

                {/* TOP */}
                <div className="flex items-center justify-between mb-4">

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white flex items-center justify-center font-bold shadow">
                      {c.consultant.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-[#3b2f1c]">
                        {c.consultant}
                      </p>
                      <p className="text-xs text-[#7a6a4f]">
                        Consultant
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[c.status]}`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* INFO */}
                <div className="space-y-2 text-sm text-[#6b5b3e] mb-5">
                  <p>📅 {c.date}</p>
                  <p>⏰ {c.time}</p>
                </div>

                {/* ACTION */}
                <button
                  className={`w-full py-3 rounded-xl text-sm font-medium transition ${
                    c.status === "Active"
                      ? "bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white shadow hover:scale-[1.05]"
                      : "bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0]"
                  }`}
                >
                  {c.status === "Active" ? "Join Call" : "View Details"}
                </button>

              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}