import { NextResponse } from "next/server";
import { z } from "zod";
import {
  updateConsultationRequestStatus,
  type ConsultationRequestStatus,
} from "../../../../../db/queries/consultationRequests";
import { emitConsultationRequestEvent } from "../../../../../lib/consultationRequestSocket";

const statusSchema = z.object({
  status: z.enum(["pending", "seen", "contacted"]),
});

type RouteContext = {
  params: {
    requestId: string;
  };
};

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const payload = await request.json();
    const parsed = statusSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    const requestId = params.requestId || (params as any).requestid;
    if (!requestId) {
      return NextResponse.json({ message: "Request ID is required." }, { status: 400 });
    }

    const updated = await updateConsultationRequestStatus(
      requestId,
      parsed.data.status as ConsultationRequestStatus
    );

    if (!updated) {
      return NextResponse.json({ message: "Consultation request not found." }, { status: 404 });
    }

    emitConsultationRequestEvent(updated.email, {
      type: "updated",
      request: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        serviceName: updated.serviceName,
        fullName: updated.fullName,
        createdAt: updated.createdAt.toISOString(),
      },
    });

    return NextResponse.json({ consultationRequest: updated });
  } catch (error) {
    console.error("[api/admin/consultation-requests/[requestId]] PATCH failed", error);
    return NextResponse.json(
      { message: "Unable to update consultation request." },
      { status: 500 }
    );
  }
}

