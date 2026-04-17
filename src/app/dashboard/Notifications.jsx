'use client';

import React from "react";

const notifications = [
  {
    id: 1,
    message: "Your appointment with John Doe has been confirmed.",
    type: "Appointment",
    time: "10:00 AM",
  },
  {
    id: 2,
    message: "Your payment of $200 has been received.",
    type: "Payment",
    time: "9:30 AM",
  },
  {
    id: 3,
    message: "Your document PAN Card.pdf has been approved.",
    type: "Document",
    time: "Yesterday",
  },
];

const typeStyles = {
  Appointment: "bg-blue-100 text-blue-700",
  Payment: "bg-green-100 text-green-700",
  Document: "bg-yellow-100 text-yellow-700",
};

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

          {/* FILTER TABS (bonus premium touch) */}
          <div className="flex gap-3 flex-wrap">
            {["All", "Appointment", "Payment", "Document"].map((tab, i) => (
              <button
                key={i}
                className="px-4 py-2 rounded-xl bg-[#faf6ed] border border-[#e8dcc0] text-sm text-[#6b5b3e] hover:bg-[#f5e6c8] transition"
              >
                {tab}
              </button>
            ))}
          </div>

          {/* NOTIFICATIONS LIST */}
          <div className="space-y-4">

            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between p-5 rounded-2xl border border-[#e8dcc0] bg-white hover:bg-[#faf6ed] transition shadow-sm"
              >

                {/* LEFT */}
                <div className="flex items-start gap-4">

                  {/* ICON */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white shadow">
                    🔔
                  </div>

                  {/* TEXT */}
                  <div>
                    <p className="text-sm text-[#3b2f1c] font-medium">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${typeStyles[n.type]}`}
                      >
                        {n.type}
                      </span>

                      <span className="text-xs text-[#7a6a4f]">
                        {n.time}
                      </span>
                    </div>
                  </div>

                </div>

                {/* RIGHT ACTION */}
                <button className="text-xs px-3 py-1 rounded-lg bg-[#f5e6c8] text-[#6b5b3e] hover:bg-[#e8dcc0] transition">
                  View
                </button>

              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}