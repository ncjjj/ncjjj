import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  listAllServiceRequestsForAdmin,
  updateServiceRequestPayment,
  updateServiceRequestStatus,
} from "../../../../db/queries/serviceRequests";
import { listRegisteredUsersForAdmin } from "../../../../db/queries/users";
import {
  listConsultantRegistrationsForAdmin,
  updateConsultantRegistrationStatus,
} from "../../../../db/queries/consultantRegistrations";
import {
  listAppointmentsForAdmin,
  updateAppointmentStatusByAdmin,
} from "../../../../db/queries/appointments";
import { listDocumentsForAdmin } from "../../../../db/queries/adminDocuments";
import { getServiceMeta } from "../../../../lib/serviceCatalog";
import { createSignedSupabaseObjectUrls } from "../../../../lib/supabaseStorage";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "../../../../lib/adminAuth";
import { emitToAdminRoom, emitToUserRoom } from "../../../../lib/socketServer";

export const runtime = "nodejs";

const updateSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  remarks: z.string().trim().max(500).optional(),
});

const consultantUpdateSchema = z.object({
  consultantRegistrationId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});

const paymentUpdateSchema = z.object({
  requestId: z.string().uuid(),
  paymentStatus: z.enum(["pending", "received"]),
  paymentNote: z.string().trim().max(500).optional(),
});

const appointmentUpdateSchema = z.object({
  appointmentId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  remarks: z.string().trim().max(500).optional(),
});

function hasAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return Boolean(verifyAdminSessionToken(token));
}

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const [requests, users, consultantRegistrations, appointments, documentGroups] = await Promise.all([
      listAllServiceRequestsForAdmin(),
      listRegisteredUsersForAdmin(),
      listConsultantRegistrationsForAdmin(),
      listAppointmentsForAdmin(),
      listDocumentsForAdmin(),
    ]);
    const signedMap = await createSignedSupabaseObjectUrls(
      requests.flatMap((item) => item.documents.map((doc) => doc.filePath)),
      3600
    );

    return NextResponse.json({
      users,
      consultantRegistrations,
      appointments,
      documentGroups,
      requests: requests.map((item) => ({
        ...item,
        documents: item.documents.map((doc) => {
          const normalizedPath = String(doc.filePath || "").replace(/^\/+/, "");
          return {
            ...doc,
            filePath: normalizedPath,
            signedUrl: signedMap[normalizedPath] || null,
          };
        }),
        serviceName: getServiceMeta(item.serviceId).name,
      })),
    });
  } catch (error) {
    console.error("[api/admin/update-status] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load requests." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const payload = await request.json();

    const consultantParsed = consultantUpdateSchema.safeParse(payload);

    if (consultantParsed.success) {
      const updatedConsultant = await updateConsultantRegistrationStatus(
        consultantParsed.data.consultantRegistrationId,
        consultantParsed.data.status
      );

      if (!updatedConsultant) {
        return NextResponse.json(
          {
            message:
              "Consultant registration not found or already finalized. No further admin changes are allowed.",
          },
          { status: 409 }
        );
      }

      emitToAdminRoom("consultantStatusUpdated", {
        eventId: randomUUID(),
        registrationId: updatedConsultant.id,
        userId: updatedConsultant.userId,
        status: updatedConsultant.status,
        occurredAt: new Date().toISOString(),
      });

      emitToUserRoom(updatedConsultant.userId, "consultantStatusUpdated", {
        eventId: randomUUID(),
        registrationId: updatedConsultant.id,
        userId: updatedConsultant.userId,
        status: updatedConsultant.status,
        occurredAt: new Date().toISOString(),
      });

      return NextResponse.json({
        updated: {
          id: updatedConsultant.id,
          status: updatedConsultant.status,
        },
      });
    }

    const appointmentParsed = appointmentUpdateSchema.safeParse(payload);

    if (appointmentParsed.success) {
      const updatedAppointment = await updateAppointmentStatusByAdmin(
        appointmentParsed.data.appointmentId,
        appointmentParsed.data.status,
        appointmentParsed.data.remarks ?? null
      );

      if (!updatedAppointment) {
        return NextResponse.json(
          {
            message:
              "Appointment not found or already finalized. After approve/reject no further status changes are allowed.",
          },
          { status: 409 }
        );
      }

      const occurredAt = new Date().toISOString();

      emitToAdminRoom("appointmentUpdated", {
        eventId: randomUUID(),
        appointmentId: updatedAppointment.id,
        slotId: updatedAppointment.slotId,
        userId: updatedAppointment.userId,
        status: updatedAppointment.status,
        adminAction: updatedAppointment.adminAction,
        adminRemarks: updatedAppointment.adminRemarks,
        occurredAt,
      });

      emitToUserRoom(updatedAppointment.userId, "appointmentUpdated", {
        eventId: randomUUID(),
        appointmentId: updatedAppointment.id,
        slotId: updatedAppointment.slotId,
        userId: updatedAppointment.userId,
        status: updatedAppointment.status,
        adminAction: updatedAppointment.adminAction,
        adminRemarks: updatedAppointment.adminRemarks,
        occurredAt,
      });

      emitToAdminRoom("appointmentSlotUpdated", {
        eventId: randomUUID(),
        slotId: updatedAppointment.slotId,
        userId: updatedAppointment.userId,
        slotDate: updatedAppointment.slotDate,
        slotStartTime: updatedAppointment.slotStartTime,
        status: updatedAppointment.status === "approved" ? "confirmed" : "available",
        selectedByUserId: updatedAppointment.userId,
        occurredAt,
      });

      emitToUserRoom(updatedAppointment.userId, "appointmentSlotUpdated", {
        eventId: randomUUID(),
        slotId: updatedAppointment.slotId,
        userId: updatedAppointment.userId,
        slotDate: updatedAppointment.slotDate,
        slotStartTime: updatedAppointment.slotStartTime,
        status: updatedAppointment.status === "approved" ? "confirmed" : "available",
        selectedByUserId: updatedAppointment.userId,
        occurredAt,
      });

      return NextResponse.json({
        updated: {
          id: updatedAppointment.id,
          status: updatedAppointment.status,
        },
      });
    }

    const paymentParsed = paymentUpdateSchema.safeParse(payload);

    if (paymentParsed.success) {
      const paymentUpdated = await updateServiceRequestPayment({
        requestId: paymentParsed.data.requestId,
        paymentStatus: paymentParsed.data.paymentStatus,
        paymentNote: paymentParsed.data.paymentNote ?? null,
      });

      if (!paymentUpdated) {
        return NextResponse.json({ message: "Request not found." }, { status: 404 });
      }

      emitToUserRoom(paymentUpdated.userId, "serviceUpdated", {
        eventId: randomUUID(),
        requestId: paymentUpdated.id,
        userId: paymentUpdated.userId,
        status: paymentUpdated.status,
        adminRemarks: null,
        paymentStatus: paymentParsed.data.paymentStatus,
        paymentNote: paymentParsed.data.paymentNote ?? null,
        occurredAt: new Date().toISOString(),
      });

      emitToAdminRoom("serviceUpdated", {
        eventId: randomUUID(),
        requestId: paymentUpdated.id,
        userId: paymentUpdated.userId,
        status: paymentUpdated.status,
        adminRemarks: null,
        paymentStatus: paymentParsed.data.paymentStatus,
        paymentNote: paymentParsed.data.paymentNote ?? null,
        occurredAt: new Date().toISOString(),
      });

      return NextResponse.json({
        updated: {
          id: paymentUpdated.id,
          paymentStatus: paymentParsed.data.paymentStatus,
        },
      });
    }

    const parsed = updateSchema.safeParse(payload);

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid update payload.";
      return NextResponse.json({ message: issue }, { status: 400 });
    }

    const updateInput = {
      requestId: parsed.data.requestId,
      status: parsed.data.status,
      remarks: parsed.data.remarks ?? null,
    };

    const updated = await updateServiceRequestStatus(updateInput);

    if (!updated) {
      return NextResponse.json(
        {
          message:
            "Request not found or already finalized. After approve/reject no further status/note changes are allowed.",
        },
        { status: 409 }
      );
    }

    const occurredAt = new Date().toISOString();
    const serviceUpdatedPayload = {
      eventId: randomUUID(),
      requestId: updated.id,
      userId: updated.userId,
      status: updated.status,
      adminRemarks: updated.adminRemarks,
      paymentStatus: updated.paymentStatus,
      paymentNote: updated.paymentNote,
      occurredAt,
    };

    emitToUserRoom(updated.userId, "serviceUpdated", serviceUpdatedPayload);
    emitToAdminRoom("serviceUpdated", serviceUpdatedPayload);

    if (typeof parsed.data.remarks === "string") {
      emitToUserRoom(updated.userId, "adminNoteAdded", {
        eventId: randomUUID(),
        requestId: updated.id,
        userId: updated.userId,
        adminRemarks: parsed.data.remarks,
        occurredAt,
      });
      emitToAdminRoom("adminNoteAdded", {
        eventId: randomUUID(),
        requestId: updated.id,
        userId: updated.userId,
        adminRemarks: parsed.data.remarks,
        occurredAt,
      });
    }

    return NextResponse.json({
      updated: {
        id: updated.id,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("[api/admin/update-status] POST failed", error);
    return NextResponse.json(
      { message: "Unable to update request status." },
      { status: 500 }
    );
  }
}
