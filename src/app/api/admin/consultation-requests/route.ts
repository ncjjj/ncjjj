import { NextResponse } from "next/server";
import { listConsultationRequests } from "../../../../db/queries/consultationRequests";
import { getDatabaseErrorMessage, getDatabaseErrorStatus } from "../../../../lib/dbErrors";
import { requireAdminSession } from "../../../../lib/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const adminGuard = await requireAdminSession(request);
  if (adminGuard.response) {
    return adminGuard.response;
  }

  try {
    const consultationRequests = await listConsultationRequests();

    return NextResponse.json({ consultationRequests });
  } catch (error) {
    console.error("[api/admin/consultation-requests] GET failed", error);
    return NextResponse.json(
      { message: getDatabaseErrorMessage(error) || "Unable to load consultation requests." },
      { status: getDatabaseErrorStatus(error) }
    );
  }
}
