import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { findUserById } from "../../../../db/queries/users";
import { decodeServiceAccess } from "../../../../lib/serviceAccess";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await findUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      serviceAccess: decodeServiceAccess(user.serviceAccess),
    });
  } catch (error) {
    console.error("[api/profile/service-access] GET failed", error);
    return NextResponse.json(
      { message: "Unable to fetch service access right now." },
      { status: 500 }
    );
  }
}
