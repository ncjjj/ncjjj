"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type ClientEnquiryFormProps = {
  supportEmail: string;
};

export default function ClientEnquiryForm({ supportEmail }: ClientEnquiryFormProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="mt-8 rounded-lg border border-slate-200 p-5">
      <h2 className="text-xl font-semibold">Quick Enquiry</h2>
      <p className="mt-2 text-sm text-slate-600">
        Send a short message and our team will connect with you.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <label className="block text-sm font-medium text-slate-700" htmlFor="client-name">
          Name
        </label>
        <input
          id="client-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />

        <label className="block text-sm font-medium text-slate-700" htmlFor="client-message">
          Message
        </label>
        <textarea
          id="client-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          rows={4}
          required
        />

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Send Enquiry
        </button>
      </form>

      {submitted && (
        <p className="mt-4 text-sm text-emerald-700">
          Thanks {name}! Please also share documents at {supportEmail} for faster support.
        </p>
      )}
    </section>
  );
}
