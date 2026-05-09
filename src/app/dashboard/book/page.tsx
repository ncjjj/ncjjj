'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { getUserSocketClient } from "../../../lib/socketClient";
import type {
  AppointmentSlotUpdatedRealtimeEvent,
  AppointmentUpdatedRealtimeEvent,
  AppointmentSlotView,
  AppointmentView,
} from "../../../types/domain";

type AppointmentApiPayload = {
  dates?: string[];
  slots?: AppointmentSlotView[];
  appointments?: AppointmentView[];
  message?: string;
};

function formatTimeLabel(value: string): string {
  return value.slice(0, 5);
}

export default function BookAppointment() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<AppointmentSlotView[]>([]);
  const [appointments, setAppointments] = useState<AppointmentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [savingSlotId, setSavingSlotId] = useState<string | null>(null);

  const appointmentBySlotId = useMemo(() => {
    const map = new Map<string, AppointmentView>();

    for (const appointment of appointments) {
      map.set(appointment.slotId, appointment);
    }

    return map;
  }, [appointments]);

  const loadAppointmentData = async (dateValue?: string) => {
    if (!userId) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/appointments${dateValue ? `?date=${dateValue}` : ""}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as AppointmentApiPayload;

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to load appointment slots.");
      }

      setAvailableDates(payload.dates || []);
      setSlots(payload.slots || []);
      setAppointments(payload.appointments || []);

      if (!selectedDate) {
        setSelectedDate(payload.dates?.[0] || new Date().toISOString().slice(0, 10));
      }
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load appointment slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      return;
    }

    loadAppointmentData();
  }, [userId]);

  useEffect(() => {
    if (!userId || !selectedDate) {
      return;
    }

    loadAppointmentData(selectedDate);
  }, [selectedDate, userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let activeSocket: Awaited<ReturnType<typeof getUserSocketClient>> | null = null;

    const handleSlotUpdated = (_event: AppointmentSlotUpdatedRealtimeEvent) => {
      loadAppointmentData(selectedDate || undefined);
    };

    const handleAppointmentUpdated = (_event: AppointmentUpdatedRealtimeEvent) => {
      loadAppointmentData(selectedDate || undefined);
    };

    const setupSocket = async () => {
      const socket = await getUserSocketClient();

      if (!socket) {
        return;
      }

      activeSocket = socket;
      socket.on("appointmentSlotUpdated", handleSlotUpdated);
      socket.on("appointmentUpdated", handleAppointmentUpdated);
    };

    setupSocket();

    return () => {
      if (!activeSocket) {
        return;
      }

      activeSocket.off("appointmentSlotUpdated", handleSlotUpdated);
      activeSocket.off("appointmentUpdated", handleAppointmentUpdated);
    };
  }, [selectedDate, userId]);

  const sendAction = async (action: "select" | "confirm" | "cancel", slot: AppointmentSlotView) => {
    setSavingSlotId(slot.id);
    setErrorMessage("");
    setMessage("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          slotId: slot.id,
          slotDate: slot.slotDate,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update appointment slot.");
      }

      setMessage(
        action === "select"
          ? "Slot selected. Confirm it to create the appointment request."
          : action === "confirm"
            ? "Appointment request created and sent to admin."
            : "Slot cancelled and released."
      );

      await loadAppointmentData(selectedDate || undefined);
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update appointment slot.");
    } finally {
      setSavingSlotId(null);
    }
  };

  return (
    <div className="dashboard-page dashboard-book flex justify-center">
      <div className="dashboard-card-shell w-full max-w-6xl overflow-hidden rounded-3xl border border-[#e8dcc0] bg-white/80 shadow-xl backdrop-blur-md">
        <div className="h-24 bg-gradient-to-r from-[#6b5b3e] via-[#b89b5e] to-[#d6b86a]" />

        <div className="dashboard-page-body space-y-7 p-7">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-[#3b2f1c]">Book Appointment</h2>
            <p className="text-sm text-[#7a6a4f]">
              Mon-Sat, 10:00 AM to 7:00 PM. One slot = one hour.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e8dcc0] bg-[#faf6ed] p-4">
            <div className="flex flex-wrap gap-2">
              {availableDates.map((dateValue) => (
                <button
                  key={dateValue}
                  type="button"
                  onClick={() => setSelectedDate(dateValue)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    selectedDate === dateValue
                      ? "bg-[#3b2f1c] text-white"
                      : "border border-[#e5d7b6] bg-white text-[#3b2f1c]"
                  }`}
                >
                  {dateValue}
                </button>
              ))}
            </div>
          </div>

          {loading ? <p className="text-sm text-[#6b5b3e]">Loading slots...</p> : null}
          {message ? <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
          {errorMessage ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p> : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {slots.map((slot) => {
              const appointment = appointmentBySlotId.get(slot.id);
              const isMine = slot.selectedByUserId === userId;
              const label = `${formatTimeLabel(slot.slotStartTime)} - ${formatTimeLabel(slot.slotEndTime)}`;

              return (
                <div key={slot.id} className="rounded-2xl border border-[#e8dcc0] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-[#3b2f1c]">{label}</p>
                      <p className="text-xs text-[#7a6a4f]">{slot.slotDate}</p>
                    </div>
                    <span className="rounded-full bg-[#faf6ed] px-3 py-1 text-xs font-semibold uppercase text-[#6b5b3e]">
                      {slot.status}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-[#4b3f2d]">
                    <p>Holder: {isMine ? "You" : slot.selectedByUserId ? "Another user" : "Free"}</p>
                    <p>Appointment: {appointment ? appointment.status : "Not created"}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {slot.status === "available" ? (
                      <button
                        type="button"
                        onClick={() => sendAction("select", slot)}
                        disabled={savingSlotId === slot.id}
                        className="rounded-xl bg-[#d6b86a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {savingSlotId === slot.id ? "Saving..." : "Select Slot"}
                      </button>
                    ) : null}

                    {isMine && slot.status === "selected" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => sendAction("confirm", slot)}
                          disabled={savingSlotId === slot.id}
                          className="rounded-xl bg-[#3b2f1c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => sendAction("cancel", slot)}
                          disabled={savingSlotId === slot.id}
                          className="rounded-xl border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-[#3b2f1c] disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </>
                    ) : null}

                    {isMine && slot.status === "confirmed" && appointment?.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => sendAction("cancel", slot)}
                        disabled={savingSlotId === slot.id}
                        className="rounded-xl border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-[#3b2f1c] disabled:opacity-60"
                      >
                        Release Slot
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#e8dcc0] bg-[#faf6ed] p-4">
            <h3 className="text-sm font-semibold text-[#3b2f1c]">My Appointments</h3>
            <div className="mt-3 space-y-3">
              {appointments.length === 0 ? (
                <p className="text-sm text-[#7a6a4f]">No appointments yet.</p>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-xl border border-[#e8dcc0] bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#3b2f1c]">
                        {appointment.slotDate} {formatTimeLabel(appointment.slotStartTime)}
                      </p>
                      <span className="text-xs font-semibold uppercase text-[#6b5b3e]">
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.adminRemarks ? (
                      <p className="mt-1 text-xs text-[#7a6a4f]">Admin note: {appointment.adminRemarks}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
