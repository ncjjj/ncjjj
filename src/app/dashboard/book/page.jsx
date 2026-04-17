'use client';

import React, { useState } from "react";

const consultants = [
  { name: "John Doe", role: "Tax Expert" },
  { name: "Jane Smith", role: "Legal Advisor" },
  { name: "Michael Brown", role: "Finance Consultant" },
];

const timeSlots = ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

export default function BookAppointment() {
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  return (
    
    <div className="flex justify-center">

      {/* MAIN CARD */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-[#e8dcc0] overflow-hidden">

        {/* TOP STRIP */}
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]"></div>

        {/* CONTENT */}
        <div className="p-8 space-y-8">



          {/* HEADER */}
          <div>
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">
              Book Appointment
            </h2>
            <p className="text-sm text-[#7a6a4f]">
              Choose your consultant, date and time
            </p>
          </div>

          {/* CONSULTANTS */}
          <div>
            <p className="text-sm text-[#6b5b3e] mb-3">Select Consultant</p>

            <div className="flex flex-wrap gap-4">
              {consultants.map((c, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedConsultant(c.name)}
                  className={`p-4 rounded-2xl cursor-pointer transition border ${
                    selectedConsultant === c.name
                      ? "bg-[#faf6ed] border-[#d6b86a] shadow-md"
                      : "border-[#e8dcc0] hover:shadow"
                  }`}
                >
                  <p className="font-medium text-[#3b2f1c]">{c.name}</p>
                  <p className="text-xs text-[#7a6a4f]">{c.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DATE */}
          <div>
            <p className="text-sm text-[#6b5b3e] mb-2">Select Date</p>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
            />
          </div>

          {/* TIME */}
          <div>
            <p className="text-sm text-[#6b5b3e] mb-3">Select Time Slot</p>

            <div className="flex flex-wrap gap-3">
              {timeSlots.map((time, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-2 rounded-xl border transition ${
                    selectedTime === time
                      ? "bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white"
                      : "bg-[#faf6ed] border-[#e5d7b6]"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* NOTES */}
          <div>
            <p className="text-sm text-[#6b5b3e] mb-2">Notes</p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
              rows="3"
            />
          </div>

          {/* BUTTON */}
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow hover:scale-[1.03] transition">
            Confirm Booking
          </button>

        </div>
      </div>
    </div>
  );
}