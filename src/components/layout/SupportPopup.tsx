"use client";

import { useState } from "react";

export default function SupportPopup() {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return null;
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[999999] w-[min(92vw,360px)] rounded-2xl border border-[#d9c69a] bg-white p-5 shadow-2xl transition-all duration-300 hover:shadow-[0_15px_30px_rgba(212,175,55,0.15)]">
      <button
        type="button"
        onClick={() => {
          setHidden(true);
        }}
        className="absolute right-3 top-3 h-7 w-7 flex items-center justify-center rounded-full border border-[#e2d4b3] bg-[#fff7e8] text-sm font-semibold text-[#5f4c2b] hover:bg-[#d9c69a]/20 transition-colors"
        aria-label="Close support popup"
      >
        ✕
      </button>
      <div className="flex items-start gap-3">
        <span className="text-xl">📞</span>
        <div className="space-y-1">
          <p className="pr-6 text-base font-semibold text-[#2f2310]">We&apos;re Here to Help</p>
          <p className="text-sm text-[#6a5a3e] leading-relaxed">
            For support or any issue regarding our services, contact us on{" "}
            <a href="tel:9999562401" className="font-semibold text-[#b89b5e] hover:underline">
              9999562401
            </a>.
          </p>
        </div>
      </div>
    </aside>
  );
}
