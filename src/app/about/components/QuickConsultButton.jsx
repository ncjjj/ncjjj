"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuickConsultButton({ consultationPath, firmName }) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    setIsNavigating(true);
    router.push(consultationPath);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isNavigating}
      className="rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-500"
      aria-label={`Book a consultation with ${firmName}`}
    >
      {isNavigating ? "Opening..." : "Book Consultation"}
    </button>
  );
}
