"use client";

import { useEffect, useState } from "react";
import { getSupabaseRealtimeClient } from "../../lib/supabaseRealtimeClient";

const statusOptions = ["pending", "approved", "rejected"];

export default function AdminRequestPanel() {
  const [requests, setRequests] = useState([]);
  const [remarksByRequest, setRemarksByRequest] = useState({});
  const [paymentByRequest, setPaymentByRequest] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/update-status", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load service requests.");
      }

      setRequests(payload.requests || []);
      setMessage("");
    } catch (error) {
      setMessage(error?.message || "Unable to load service requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    const client = getSupabaseRealtimeClient();

    if (!client) {
      return;
    }

    const channel = client
      .channel("service-request-admin-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests" },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (requestId, status) => {
    try {
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          status,
          remarks: remarksByRequest[requestId] || "",
          paymentStatus: paymentByRequest[requestId] || "pending",
          paymentNote: remarksByRequest[requestId] || "",
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update request.");
      }

      await loadRequests();
      setMessage("Status updated successfully.");
    } catch (error) {
      setMessage(error?.message || "Unable to update request.");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#3b2f1c]">Service Request Verification</h1>
        <p className="text-sm text-[#6b5b3e]">Review documents and update request/payment status</p>
      </div>

      {loading ? <p className="text-sm text-[#6b5b3e]">Loading requests...</p> : null}
      {message ? <p className="mb-4 text-sm text-[#6b5b3e]">{message}</p> : null}

      <div className="space-y-5">
        {requests.map((request) => (
          <div key={request.id} className="rounded-2xl border border-[#e8dcc0] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#3b2f1c]">{request.serviceName}</h2>
                <p className="text-xs text-[#7a6a4f]">User: {request.userName} ({request.userEmail})</p>
                <p className="text-xs text-[#7a6a4f]">Phone: {request.userPhone}</p>
              </div>
              <p className="text-sm text-[#5a5040]">Current Status: {request.status}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {request.documents?.map((doc) => (
                doc.signedUrl ? (
                  <a
                    key={doc.id}
                    href={doc.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[#e8dcc0] bg-[#faf6ed] px-3 py-2 text-sm text-[#3b2f1c]"
                  >
                    {doc.type}
                  </a>
                ) : (
                  <span
                    key={doc.id}
                    className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                  >
                    {doc.type}
                  </span>
                )
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <textarea
                value={remarksByRequest[request.id] || request.adminRemarks || ""}
                onChange={(event) =>
                  setRemarksByRequest((prev) => ({
                    ...prev,
                    [request.id]: event.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-xl border border-[#e5d7b6] bg-[#faf6ed] px-4 py-3 text-sm"
                placeholder="Add remarks for user"
              />

              <div className="space-y-3">
                <select
                  value={paymentByRequest[request.id] || request.paymentStatus || "pending"}
                  onChange={(event) =>
                    setPaymentByRequest((prev) => ({
                      ...prev,
                      [request.id]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#e5d7b6] bg-[#faf6ed] px-4 py-3 text-sm"
                >
                  <option value="pending">Payment Pending</option>
                  <option value="received">Payment Received</option>
                </select>

                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateStatus(request.id, status)}
                      className="rounded-lg border border-[#d6b86a] bg-[#fff8e2] px-3 py-2 text-sm font-medium text-[#3b2f1c]"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d9c9a4] bg-[#fffaf0] p-8 text-center text-[#6b5b3e]">
            No service requests submitted yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
