'use client';

import React, { useState } from "react";

export default function BookAppointment() {
  const [selectedConsultant, setSelectedConsultant] = useState("");
  const [selectedDateTime, setSelectedDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm text-[#6b5b3e] mb-2">Consultant Name</p>
              <input
                type="text"
                value={selectedConsultant}
                onChange={(e) => setSelectedConsultant(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
                placeholder="Type consultant name"
                required
              />
            </div>

            <div>
              <p className="text-sm text-[#6b5b3e] mb-2">Preferred Date & Time</p>
              <input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
                required
              />
            </div>

            <div>
              <p className="text-sm text-[#6b5b3e] mb-2">Notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
                rows="3"
              />
            </div>

            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow hover:scale-[1.03] transition" type="submit">
              Confirm Booking
            </button>
          </form>

          {submitted ? (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
              Booking request submitted. Your real appointment details will appear in consultations.
            </p>
          ) : null}

        </div>
      </div>
    </div>
  );
}