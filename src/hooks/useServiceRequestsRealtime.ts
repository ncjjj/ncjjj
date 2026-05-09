"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserSocketClient } from "../lib/socketClient";
import type {
  AdminNoteAddedRealtimeEvent,
  ApiMessageResponse,
  ServicePreviewRealtimeEvent,
  ServiceRequestStats,
  ServiceUpdatedRealtimeEvent,
  ServiceRequestView,
} from "../types/domain";

type ServiceRequestApiResponse = {
  requests?: ServiceRequestView[];
} & Partial<ApiMessageResponse>;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function useServiceRequestsRealtime() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const [requests, setRequests] = useState<ServiceRequestView[]>([]);
  const [previewByRequest, setPreviewByRequest] = useState<
    Record<
      string,
      {
        status: ServicePreviewRealtimeEvent["status"];
        adminRemarks: string | null;
        paymentStatus: ServicePreviewRealtimeEvent["paymentStatus"];
        paymentNote: string | null;
        occurredAt: string;
      }
    >
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const seenEventIdsRef = useRef<Set<string>>(new Set());

  const loadRequests = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/service-request", { cache: "no-store" });
      const payload = (await response.json()) as ServiceRequestApiResponse;

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load service requests.");
      }

      setRequests(payload.requests ?? []);
      setPreviewByRequest({});
      setError("");
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError, "Unable to load service requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  const isDuplicateEvent = useCallback((eventId: string) => {
    const seen = seenEventIdsRef.current;

    if (seen.has(eventId)) {
      return true;
    }

    seen.add(eventId);

    if (seen.size > 250) {
      const firstKey = seen.values().next().value;
      if (firstKey) {
        seen.delete(firstKey);
      }
    }

    return false;
  }, []);

  const applyServiceUpdate = useCallback((event: ServiceUpdatedRealtimeEvent) => {
    setPreviewByRequest((current) => {
      if (!current[event.requestId]) {
        return current;
      }

      const next = { ...current };
      delete next[event.requestId];
      return next;
    });

    setRequests((currentRequests) => {
      const nextRequests = currentRequests.map((request) => {
        if (request.id !== event.requestId) {
          return request;
        }

        return {
          ...request,
          status: event.status,
          adminRemarks: event.adminRemarks,
          paymentStatus: event.paymentStatus,
          paymentNote: event.paymentNote ?? request.paymentNote,
        };
      });

      const requestFound = nextRequests.some((request) => request.id === event.requestId);

      if (!requestFound) {
        void loadRequests();
      }

      return nextRequests;
    });
  }, [loadRequests]);

  const applyAdminNoteUpdate = useCallback((event: AdminNoteAddedRealtimeEvent) => {
    setRequests((currentRequests) => {
      return currentRequests.map((request) => {
        if (request.id !== event.requestId) {
          return request;
        }

        return {
          ...request,
          adminRemarks: event.adminRemarks,
        };
      });
    });
  }, []);

  const applyServicePreview = useCallback((event: ServicePreviewRealtimeEvent) => {
    setPreviewByRequest((current) => ({
      ...current,
      [event.requestId]: {
        status: event.status,
        adminRemarks: event.adminRemarks,
        paymentStatus: event.paymentStatus,
        paymentNote: event.paymentNote,
        occurredAt: event.occurredAt,
      },
    }));
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    const setupSocket = async () => {
      const socket = await getUserSocketClient();

      if (!socket || disposed) {
        return;
      }

      const handleConnect = () => {
        socket.emit("joinUserRoom", { userId });
        loadRequests();
      };

      const handleServiceUpdated = (event: ServiceUpdatedRealtimeEvent) => {
        if (!event || event.userId !== userId || isDuplicateEvent(event.eventId)) {
          return;
        }

        applyServiceUpdate(event);
      };

      const handleAdminNoteAdded = (event: AdminNoteAddedRealtimeEvent) => {
        if (!event || event.userId !== userId || isDuplicateEvent(event.eventId)) {
          return;
        }

        applyAdminNoteUpdate(event);
      };

      const handleServicePreview = (event: ServicePreviewRealtimeEvent) => {
        if (!event || event.userId !== userId || isDuplicateEvent(event.eventId)) {
          return;
        }

        applyServicePreview(event);
      };

      socket.on("connect", handleConnect);
      socket.on("serviceUpdated", handleServiceUpdated);
      socket.on("adminNoteAdded", handleAdminNoteAdded);
      socket.on("servicePreview", handleServicePreview);

      if (socket.connected) {
        handleConnect();
      }

      cleanup = () => {
        socket.off("connect", handleConnect);
        socket.off("serviceUpdated", handleServiceUpdated);
        socket.off("adminNoteAdded", handleAdminNoteAdded);
        socket.off("servicePreview", handleServicePreview);
      };
    };

    setupSocket();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [applyAdminNoteUpdate, applyServicePreview, applyServiceUpdate, isDuplicateEvent, loadRequests, userId]);

  const stats = useMemo<ServiceRequestStats>(() => {
    return {
      total: requests.length,
      pending: requests.filter((item) => item.status === "pending").length,
      approved: requests.filter((item) => item.status === "approved").length,
      rejected: requests.filter((item) => item.status === "rejected").length,
    };
  }, [requests]);

  return {
    requests,
    previewByRequest,
    stats,
    loading,
    error,
    reload: loadRequests,
  };
}
