'use client';

import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type TicketForm = {
  subject: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

export default function SupportCenter() {
  const [ticket, setTicket] = useState<TicketForm>({ subject: "", description: "" });
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const faqs: FaqItem[] = [];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTicket({ subject: "", description: "" });
  };

  return (
    <div className="dashboard-page dashboard-support min-h-screen flex justify-center p-6">

      <div className="dashboard-page-inner w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="dashboard-page-header dashboard-support-header text-center">
          <h2 className="text-3xl font-semibold text-[#3b2f1c]">
            Support Center
          </h2>
          <p className="text-sm text-[#7a6a4f]">
            We're here to help you anytime
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-5">

          {/* Ticket Section */}
          <div className="dashboard-card-shell dashboard-support-card bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow border border-[#e8dcc0] space-y-4">

            <h3 className="text-lg font-semibold text-[#3b2f1c]">
              Raise a Ticket
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                name="subject"
                value={ticket.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
                required
              />

              <textarea
                name="description"
                value={ticket.description}
                onChange={handleChange}
                placeholder="Describe your issue..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
                required
              />

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow hover:scale-[1.03] transition"
              >
                Submit Ticket
              </button>

            </form>
          </div>

          {/* FAQ Section */}
          <div className="dashboard-card-shell dashboard-support-card bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow border border-[#e8dcc0] space-y-4">

            <h3 className="text-lg font-semibold text-[#3b2f1c]">
              FAQs
            </h3>

            {faqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d9c9a4] p-5 text-center bg-[#fffaf0]">
                <p className="text-sm font-medium text-[#3b2f1c]">No predefined FAQs</p>
                <p className="text-xs text-[#7a6a4f] mt-2">Support updates and FAQs will be added based on real requests.</p>
              </div>
            ) : null}

            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border rounded-xl border-[#e5d7b6] overflow-hidden"
              >

                {/* Question */}
                <button
                  onClick={() =>
                    setActiveFAQ(activeFAQ === index ? null : index)
                  }
                  className="w-full text-left px-4 py-3 flex justify-between items-center bg-[#faf6ed] hover:bg-[#f5e6c8]"
                >
                  <span className="text-sm font-medium text-[#3b2f1c]">
                    {faq.question}
                  </span>
                  <span className="text-[#6b5b3e]">
                    {activeFAQ === index ? "−" : "+"}
                  </span>
                </button>

                {/* Answer */}
                {activeFAQ === index && (
                  <div className="px-4 py-3 text-sm text-[#6b5b3e] bg-white">
                    {faq.answer}
                  </div>
                )}

              </div>
            ))}

            {submitted ? (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
                Ticket submitted successfully. Our support team will respond shortly.
              </p>
            ) : null}

          </div>

        </div>

        {/* Contact Card */}
        <div className="dashboard-card-shell dashboard-support-contact bg-white border border-[#e8dcc0] p-6 rounded-3xl shadow-lg text-center space-y-2">
          <h3 className="text-xl font-bold text-[#3b2f1c] flex items-center justify-center gap-2">
            <span>📞</span> We’re Here to Help
          </h3>
          <p className="text-sm text-[#6a5a3e] max-w-lg mx-auto">
            For support or any issue regarding our services, contact us on{" "}
            <a href="tel:9999562401" className="font-semibold text-[#8a7340] hover:underline">
              9999562401
            </a>{" "}
            or email us at{" "}
            <a href="mailto:info@ncjlegal.com" className="font-semibold text-[#8a7340] hover:underline">
              info@ncjlegal.com
            </a>.
          </p>
        </div>

      </div>
    </div>
  );
}