'use client';

import React, { useState } from "react";

const faqs = [
  {
    question: "How can I book an appointment?",
    answer:
      "Go to the Book Appointment section and choose your consultant, date, and time.",
  },
  {
    question: "How do I upload documents?",
    answer:
      "Navigate to the Documents section and use the upload feature to add files.",
  },
  {
    question: "How can I contact support?",
    answer:
      "You can raise a ticket or email us directly for urgent queries.",
  },
];

export default function SupportCenter() {
  const [ticket, setTicket] = useState({ subject: "", description: "" });
  const [activeFAQ, setActiveFAQ] = useState(null);

  const handleChange = (e) => {
    setTicket({ ...ticket, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTicket({ subject: "", description: "" });
  };

  return (
    <div className="min-h-screen flex justify-center p-6">

      <div className="w-full max-w-5xl space-y-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-[#3b2f1c]">
            Support Center
          </h2>
          <p className="text-sm text-[#7a6a4f] mt-1">
            We're here to help you anytime
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Ticket Section */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow border border-[#e8dcc0] space-y-5">

            <h3 className="text-lg font-semibold text-[#3b2f1c]">
              Raise a Ticket
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">

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
                rows="4"
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
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow border border-[#e8dcc0] space-y-4">

            <h3 className="text-lg font-semibold text-[#3b2f1c]">
              FAQs
            </h3>

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

          </div>

        </div>

        {/* Contact Card */}
        <div className="bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white p-6 rounded-3xl shadow text-center">
          <h3 className="text-lg font-semibold">Need Immediate Help?</h3>
          <p className="text-sm mt-1">
            Contact us at support@example.com
          </p>
        </div>

      </div>
    </div>
  );
}