'use client';

import React, { useState } from "react";

export default function Payments() {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!amount.trim()) {
      return;
    }

    setSubmitted(true);
    setAmount("");
    setReference("");
  };

  return (
    <div className="min-h-screen flex justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-[#3b2f1c]">Payments</h2>
          <p className="text-sm text-[#7a6a4f] mt-1">
            No predefined transactions are shown. Submit a payment to start your history.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow border border-[#e8dcc0]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#6b5b3e] mb-2" htmlFor="payment-amount">
                Amount
              </label>
              <input
                id="payment-amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
                placeholder="Enter amount"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#6b5b3e] mb-2" htmlFor="payment-reference">
                Reference (optional)
              </label>
              <input
                id="payment-reference"
                type="text"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e5d7b6] bg-[#faf6ed]"
                placeholder="Transaction note or invoice id"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d6b86a] to-[#b89b5e] text-white font-semibold shadow hover:scale-[1.03] transition"
            >
              Submit Payment
            </button>
          </form>

          {submitted ? (
            <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
              Payment request submitted. Your real transaction record will appear once processed.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
