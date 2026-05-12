import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Booking feature disabled - return 410 Gone for all appointment endpoints

export async function GET(_request: NextRequest) {
  return NextResponse.json({ message: "Appointment booking has been removed." }, { status: 410 });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({ message: "Appointment booking has been removed." }, { status: 410 });
}
