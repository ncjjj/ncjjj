import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { listConsultationRequestsForEmail } from "../../../db/queries/consultationRequests";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ message: "You must sign in to view requests." }, { status: 401 });
  }

  try {
    const consultationRequests = await listConsultationRequestsForEmail(email);

    return NextResponse.json({ consultationRequests });
  } catch (error) {
    console.error("[api/consultation-requests] GET failed", error);
    return NextResponse.json({ message: "Unable to load your requests." }, { status: 500 });
  }
}
