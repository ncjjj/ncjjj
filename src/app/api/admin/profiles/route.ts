import { NextResponse } from "next/server";
import { getDb } from "../../../../db/index";
import { profiles, users } from "../../../../db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        email: profiles.email,
        phone: profiles.phone,
        firmName: profiles.firmName,
        createdAt: profiles.createdAt,
        userId: users.id,
        serviceAccess: users.serviceAccess,
        panCard: users.panCard,
        aadhaarCard: users.aadhaarCard,
        dob: users.dob,
        gender: users.gender,
        citizen: users.citizen,
        residentialStatus: users.residentialStatus,
        passwordPlain: users.passwordPlain,
      })
      .from(profiles)
      .leftJoin(users, eq(users.email, profiles.email))
      .orderBy(desc(profiles.createdAt));

    return NextResponse.json({ profiles: rows });
  } catch (error) {
    console.error("[api/admin/profiles] GET failed", error);
    return NextResponse.json({ message: "Unable to load profiles." }, { status: 500 });
  }
}
