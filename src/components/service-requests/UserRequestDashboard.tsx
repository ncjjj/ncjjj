"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { ArrowRight, BadgeCheck, Clock3, Eye, RefreshCcw, Sparkles } from "lucide-react";

type ConsultationRequestStatus = "pending" | "seen" | "contacted";

type ConsultationRequest = {
  id: string;
  serviceName: string;
  fullName: string;
  email: string;
  phone: string;
  firmName: string | null;
  address: string;
  note: string | null;
  status: ConsultationRequestStatus;
  createdAt: string;
};

type RequestEventPayload = {
  type: "created" | "updated";
  request: {
    id: string;
    email: string;
    status: ConsultationRequestStatus;
    serviceName: string;
    fullName: string;
    createdAt: string;
  };
};

type StatusMeta = {
  label: string;
  tone: string;
  description: string;
  icon: typeof Clock3;
  progressValue: number;
};

const STATUS_META: Record<ConsultationRequestStatus, StatusMeta> = {
  pending: {
    label: "Applied / Pending",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    description: "Your request is submitted and waiting for admin review.",
    icon: Clock3,
    progressValue: 1,
  },
  seen: {
    label: "Seen by Admin",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
    description: "Admin has opened the request and is checking the details.",
    icon: Eye,
    progressValue: 2,
  },
  contacted: {
    label: "Completed",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    description: "The request has been handled and a response has been shared.",
    icon: BadgeCheck,
    progressValue: 3,
  },
};

const STAGES = [
  { key: "applied", title: "Applied", note: "Request received" },
  { key: "seen", title: "Seen", note: "Admin opened it" },
  { key: "pending", title: "Pending", note: "Under review" },
  { key: "completed", title: "Completed", note: "Admin replied" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getRequestProgress(status: ConsultationRequestStatus) {
  return STATUS_META[status].progressValue;
}

function getSummaryCounts(requests: ConsultationRequest[]) {
  return {
    applied: requests.length,
    seen: requests.filter((item) => item.status === "seen").length,
    pending: requests.filter((item) => item.status === "pending").length,
    completed: requests.filter((item) => item.status === "contacted").length,
  };
}

export default function UserRequestDashboard() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveMessage, setLiveMessage] = useState("Waiting for your latest request status...");
  const [error, setError] = useState("");

  const email = session?.user?.email?.trim().toLowerCase() || "";

  const summary = useMemo(() => getSummaryCounts(requests), [requests]);

  const loadRequests = async () => {
    if (!email) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/consultation-requests", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as
        | { consultationRequests?: ConsultationRequest[]; message?: string }
        | null;

      if (!response.ok || !payload?.consultationRequests) {
        throw new Error(payload?.message || "Unable to load your requests.");
      }

      setRequests(payload.consultationRequests);
      setLiveMessage(
        payload.consultationRequests.length > 0
          ? "Live sync is active. Admin status updates will appear here instantly."
          : "No requests found yet. Once you apply, updates will appear live here."
      );
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load your requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated" || !email) {
      return;
    }

    void loadRequests();
  }, [email, status]);

  useEffect(() => {
    if (status !== "authenticated" || !email) {
      return;
    }

    let socket: Socket | null = null;
    let cancelled = false;

    const connectSocket = async () => {
      await fetch("/api/socket", { cache: "no-store" });

      if (cancelled) {
        return;
      }

      socket = io({
        path: "/socket.io",
        transports: ["websocket"],
        query: { email },
      });

      socket.on("connect", () => {
        setLiveMessage("Connected to live status updates.");
      });

      socket.on("consultation-request-updated", (payload: RequestEventPayload) => {
        if (payload.request.email.trim().toLowerCase() !== email) {
          return;
        }

        setRequests((current) => {
          const exists = current.some((item) => item.id === payload.request.id);

          if (exists) {
            return current.map((item) =>
              item.id === payload.request.id
                ? {
                    ...item,
                    status: payload.request.status,
                    createdAt: payload.request.createdAt,
                  }
                : item
            );
          }

          return [
            {
              id: payload.request.id,
              serviceName: payload.request.serviceName,
              fullName: payload.request.fullName,
              email: payload.request.email,
              phone: "",
              firmName: null,
              address: "",
              note: null,
              status: payload.request.status,
              createdAt: payload.request.createdAt,
            },
            ...current,
          ];
        });

        setLiveMessage(
          payload.type === "created"
            ? "A new request was added to your live feed."
            : `Request status updated to ${STATUS_META[payload.request.status].label}.`
        );
      });
    };

    void connectSocket();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [email, status]);

  const renderRequestCard = (request: ConsultationRequest) => {
    const statusMeta = STATUS_META[request.status];
    const StatusIcon = statusMeta.icon;
    const progress = getRequestProgress(request.status);

    return (
      <article
        key={request.id}
        className="rounded-[28px] border border-[#eadfc7] bg-gradient-to-br from-white via-[#fffdf8] to-[#f8f0df] p-5 shadow-[0_18px_60px_-32px_rgba(117,88,31,0.45)] sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.tone}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusMeta.label}
              </span>
              <span className="rounded-full bg-[#f4ead6] px-3 py-1 text-xs font-semibold text-[#7a5e24]">
                {request.serviceName}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[#342812]">{request.fullName}</h3>
              <p className="mt-1 text-sm text-[#7a6a4f]">Applied on {formatDate(request.createdAt)}</p>
            </div>

            <p className="max-w-3xl text-sm leading-6 text-[#5d4c32]">{statusMeta.description}</p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[#f0e4c9] bg-white/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7c3e]">Email</p>
                <p className="mt-1 break-words text-sm text-[#3d2f1a]">{request.email}</p>
              </div>
              <div className="rounded-2xl border border-[#f0e4c9] bg-white/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7c3e]">Phone</p>
                <p className="mt-1 text-sm text-[#3d2f1a]">{request.phone}</p>
              </div>
              <div className="rounded-2xl border border-[#f0e4c9] bg-white/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7c3e]">Firm</p>
                <p className="mt-1 text-sm text-[#3d2f1a]">{request.firmName || "Not added"}</p>
              </div>
              <div className="rounded-2xl border border-[#f0e4c9] bg-white/80 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a7c3e]">Location</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#3d2f1a]">{request.address}</p>
              </div>
            </div>
          </div>

          <div className="min-w-[260px] rounded-[24px] border border-[#ecdcb3] bg-[#fffaf0] p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9c7a3f]">Progress</span>
              <span className="text-xs font-semibold text-[#6f5629]">Step {progress} of 3</span>
            </div>

            <div className="space-y-3">
              {STAGES.map((stage, index) => {
                const stageNumber = index + 1;
                const active = stageNumber <= progress;

                return (
                  <div key={stage.key} className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                        active
                          ? "border-[#b79447] bg-[#d8b86b] text-white"
                          : "border-[#e4d4b2] bg-white text-[#a38b60]"
                      }`}
                    >
                      {stageNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#3c2f19]">{stage.title}</p>
                      <p className="text-xs text-[#81683e]">{stage.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-[#ead8ab] bg-white p-3 text-sm text-[#5e4a28]">
              {statusMeta.description}
            </div>
          </div>
        </div>
      </article>
    );
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center py-10">
        <div className="w-full max-w-6xl rounded-[32px] border border-[#eadfc7] bg-white/90 p-6 shadow-xl">
          <p className="text-sm text-[#7a6a4f]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-6">
      <div className="w-full max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[34px] border border-[#e7d7b3] bg-[radial-gradient(circle_at_top_left,_rgba(248,236,207,0.95),_rgba(255,255,255,0.95)_40%,_rgba(245,230,200,0.85))] p-6 shadow-[0_24px_70px_-35px_rgba(88,67,23,0.5)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dfc384] bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6a2f]">
                <Sparkles className="h-3.5 w-3.5" />
                Live request tracking
              </span>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-[#2f2412] sm:text-4xl">My Requests</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f5a37] sm:text-base">
                  Apne service requests ko ek hi place par dekho. Jaise hi admin status change karega, yeh page socket ke through live update hoga.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-[#5d4c32]">
                <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm">Applied: {summary.applied}</span>
                <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm">Seen: {summary.seen}</span>
                <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm">Pending: {summary.pending}</span>
                <span className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm">Completed: {summary.completed}</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-lg backdrop-blur-sm lg:min-w-[290px]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#99773a]">Live status</p>
              <p className="mt-2 text-sm leading-6 text-[#4b3c25]">{liveMessage}</p>
              <button
                type="button"
                onClick={loadRequests}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#5b4927] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#483718]"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[28px] border border-[#eadfc7] bg-white/90 p-6 text-sm text-[#7a6a4f] shadow-lg">
            Loading your requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#d9c9a4] bg-[#fffaf0] p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#a8873d] shadow-sm">
              <ArrowRight className="h-7 w-7 rotate-45" />
            </div>
            <h3 className="text-xl font-semibold text-[#3d2e18]">No requests yet</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6f5a37]">
              Jab aap koi service apply karoge, woh yahan appear hoga aur admin ke status updates socket ke through live dikhenge.
            </p>
          </div>
        ) : (
          <div className="space-y-5">{requests.map(renderRequestCard)}</div>
        )}
      </div>
    </div>
  );
}
