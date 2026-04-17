import React, { useState } from "react";

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
  Appointment: {
    color: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-300",
    icon: "📅",
  },
  Payment: {
    color: "text-green-600",
    bg: "bg-green-100",
    border: "border-green-300",
    icon: "💰",
  },
  Document: {
    color: "text-yellow-600",
    bg: "bg-yellow-100",
    border: "border-yellow-300",
    icon: "📄",
  },
};

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredNotifications =
    activeTab === "All"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  return (
    <div className="min-h-screen flex justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-[#3b2f1c]">
            Notifications
          </h2>
          <p className="text-sm text-[#7a6a4f] mt-1">
            Stay updated with your latest activity
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-3">
          {["All", "Appointment", "Payment", "Document"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl border text-[#6b5b3e] transition font-medium shadow-sm
                ${
                  activeTab === tab
                    ? "bg-[#f5e6c8] border-[#e5d7b6]"
                    : "bg-[#faf6ed] border-[#e8dcc0] hover:bg-[#f5e6c8]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notifications Card */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow border border-[#e8dcc0] space-y-4">
          {filteredNotifications.map((n) => {
            const style = typeStyles[n.type];

            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border-l-4 ${style.border} hover:bg-[#faf6ed] transition`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${style.bg} text-lg`}
                >
                  {style.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <p className="text-[#3b2f1c] text-sm font-medium">
                    {n.message}
                  </p>
                  <span className="text-xs text-[#7a6a4f] mt-1 block">
                    {n.time}
                  </span>
                </div>

                {/* Badge */}
                <span
                  className={`text-xs px-3 py-1 rounded-full ${style.bg} ${style.color}`}
                >
                  {n.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}