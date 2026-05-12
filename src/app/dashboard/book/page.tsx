'use client';

import React from "react";

export default function BookAppointmentRemoved() {
  return (
    <div className="dashboard-page dashboard-book flex justify-center">
      <div className="dashboard-card-shell w-full max-w-4xl overflow-hidden rounded-3xl border border-[#e8dcc0] bg-white/80 shadow-xl backdrop-blur-md">
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]" />
        <div className="dashboard-page-body space-y-7 p-7">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">Booking Removed</h2>
            <p className="text-sm text-[#7a6a4f]">The appointment booking feature has been removed.</p>
          </div>
          <div className="rounded-2xl border border-[#e8dcc0] bg-[#faf6ed] p-4">
            <p className="text-sm text-[#6b5b3e]">If you need scheduling, please contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
