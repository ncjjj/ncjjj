import { NextResponse } from "next/server";
import { listProfiles } from "../../../../db/queries/profiles";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = await listProfiles();

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("[api/admin/profiles] GET failed", error);
    return NextResponse.json({ message: "Unable to load profiles." }, { status: 500 });
  }
}
