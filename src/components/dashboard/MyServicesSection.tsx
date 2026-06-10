"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { CheckCircle2, Clock, Zap } from "lucide-react";

type ServiceTaskStatus = "due" | "wip" | "complete";

interface ServiceTask {
  id: string;
  serviceName: string;
  documentType?: string;
  status: ServiceTaskStatus;
  createdAt: string;
  updatedAt?: string;
}

type ConsultationRequestUpdatePayload = {
  request?: {
    email?: string;
  };
};

type UserUpdatePayload = {
  type?: string;
};

type StatusMeta = {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Clock;
  description: string;
};

const STATUS_META: Record<ServiceTaskStatus, StatusMeta> = {
  due: {
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    icon: Clock,
    description: "Waiting for admin action",
  },
  wip: {
    label: "In Progress",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: Zap,
    description: "Admin is working on it",
  },
  complete: {
    label: "Completed",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
    description: "Admin has completed this",
  },
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export default function MyServicesSection() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const email = session?.user?.email?.trim().toLowerCase() || "";

  const summary = useMemo(() => {
    return {
      total: tasks.length,
      due: tasks.filter((task) => task.status === "due").length,
      wip: tasks.filter((task) => task.status === "wip").length,
      complete: tasks.filter((task) => task.status === "complete").length,
    };
  }, [tasks]);

  const loadTasks = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      if (!email) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        const response = await fetch("/api/profile/service-tasks", {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => null)) as {
          message?: string;
          serviceTasks?: ServiceTask[];
        } | null;

        if (!response.ok) {
          throw new Error(data?.message || `Failed to fetch services (${response.status})`);
        }

        setTasks(data?.serviceTasks || []);
        setError("");
      } catch (err) {
        console.error("Error loading service tasks:", err);
        setError("Failed to load services");
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [email]
  );

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status !== "authenticated" || !email) {
      setTasks([]);
      setLoading(false);
      return;
    }

    void loadTasks();
  }, [status, email, loadTasks]);

  useEffect(() => {
    if (status !== "authenticated" || !email) {
      return;
    }

    let cancelled = false;
    let socketInstance: Socket | null = null;

    const connectSocket = async () => {
      try {
        await fetch("/api/socket", { cache: "no-store" });

        if (cancelled) {
          return;
        }

        socketInstance = io({
          path: "/socket.io",
          transports: ["websocket"],
          query: { email },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        socketInstance.on("consultation-request-updated", (payload: ConsultationRequestUpdatePayload) => {
          const payloadEmail = payload?.request?.email?.trim().toLowerCase();

          if (!payloadEmail || payloadEmail === email) {
            void loadTasks({ showLoading: false });
          }
        });

        socketInstance.on("user-update", (payload: UserUpdatePayload) => {
          if (payload?.type === "consultation-request-updated") {
            void loadTasks({ showLoading: false });
          }
        });
      } catch (err) {
        console.error("Failed to connect service task socket", err);
      }
    };

    void connectSocket();

    return () => {
      cancelled = true;
      socketInstance?.disconnect();
    };
  }, [status, email, loadTasks]);

  if (status === "loading" || loading) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-800">My Services</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Services</h2>
        <p className="mt-1 text-sm text-gray-600">Track your applied services and their status</p>
      </div>

      {tasks.length > 0 ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{summary.due}</p>
            <p className="text-xs text-amber-600">Pending</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{summary.wip}</p>
            <p className="text-xs text-blue-600">In Progress</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{summary.complete}</p>
            <p className="text-xs text-emerald-600">Completed</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
            <p className="text-2xl font-bold text-gray-700">{summary.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {tasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center sm:p-8">
          <p className="mb-1 font-medium text-gray-600">No services applied yet</p>
          <p className="text-sm text-gray-500">Apply for services to track their status here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const meta = STATUS_META[task.status];
            const IconComponent = meta.icon;

            return (
              <div
                key={task.id}
                className={`rounded-lg border-2 ${meta.bgColor} p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${meta.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="min-w-0 break-words font-semibold text-gray-800">{task.serviceName}</h3>
                        <span
                          className={`inline-block rounded-full border bg-white px-2.5 py-1 text-xs font-medium ${meta.color} ${
                            meta.bgColor.includes("amber")
                              ? "border-amber-300"
                              : meta.bgColor.includes("blue")
                                ? "border-blue-300"
                                : "border-emerald-300"
                          }`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-gray-600">{meta.description}</p>
                      <p className="text-xs text-gray-500">Applied on {formatDate(task.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/60">
                  <div
                    className={`h-full transition-all ${
                      task.status === "due"
                        ? "w-1/3 bg-amber-500"
                        : task.status === "wip"
                          ? "w-2/3 bg-blue-500"
                          : "w-full bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
