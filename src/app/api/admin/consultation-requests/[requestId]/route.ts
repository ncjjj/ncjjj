import { NextResponse } from "next/server";
import { z } from "zod";
import {
  updateConsultationRequestStatus,
  type ConsultationRequestStatus,
} from "../../../../../db/queries/consultationRequests";

const statusSchema = z.object({
  status: z.enum(["pending", "seen", "contacted"]),
});

type RouteContext = {
  params: {
    requestId: string;
  };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const payload = await request.json();
    console.log("PATCH API called with params:", params, "payload:", payload);
    const parsed = statusSchema.safeParse(payload);

    if (!parsed.success) {
      console.log("PATCH validation failed:", parsed.error);
      return NextResponse.json({ message: "Invalid status." }, { status: 400 });
    }

    const updated = await updateConsultationRequestStatus(
      params.requestId,
      parsed.data.status as ConsultationRequestStatus
    );

    if (!updated) {
      console.log("PATCH request not found for ID:", params.requestId);
      return NextResponse.json({ message: "Consultation request not found." }, { status: 404 });
    }

    console.log("PATCH updated successfully:", updated);
    return NextResponse.json({ consultationRequest: updated });
  } catch (error) {
    console.error("[api/admin/consultation-requests/[requestId]] PATCH failed", error);
    return NextResponse.json(
      { message: "Unable to update consultation request." },
      { status: 500 }
    );
  }
}
