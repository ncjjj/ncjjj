'use client';

import React from "react";

export default function Notifications() {
  return (
    <div className="flex justify-center mt-10">

      {/* MAIN CARD */}
      <div className="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-[#e8dcc0] bg-white/80 backdrop-blur-md">

        {/* GOLD HEADER */}
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

        {/* CONTENT */}
        <div className="p-8 space-y-8">

          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">
              Notifications
            </h2>
            <p className="text-sm text-[#7a6a4f]">
              Stay updated with your latest activity
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {["All", "Appointment", "Payment", "Document"].map((tab, i) => (
              <button
                key={i}
                type="button"
                className="px-4 py-2 rounded-xl bg-[#faf6ed] border border-[#e8dcc0] text-sm text-[#6b5b3e] hover:bg-[#f5e6c8] transition"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-[#d9c9a4] bg-[#fffaf0] p-8 text-center">
              <p className="text-lg font-semibold text-[#3b2f1c]">No notifications yet</p>
              <p className="text-sm text-[#7a6a4f] mt-2">
                Real updates from appointments, documents and payments will appear here.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}