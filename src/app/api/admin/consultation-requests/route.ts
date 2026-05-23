import { NextResponse } from "next/server";
import { listConsultationRequests } from "../../../../db/queries/consultationRequests";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const consultationRequests = await listConsultationRequests();

    return NextResponse.json({ consultationRequests });
  } catch (error) {
    console.error("[api/admin/consultation-requests] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load consultation requests." },
      { status: 500 }
    );
  }
}
