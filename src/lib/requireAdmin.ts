import { NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "./adminRequestSession";
import type { AdminSessionWithAdmin } from "../db/queries/admin";
import { getDatabaseErrorMessage, getDatabaseErrorStatus } from "./dbErrors";

type AdminGuardResult =
  | { session: AdminSessionWithAdmin; response: null }
  | { session: null; response: NextResponse };

export async function requireAdminSession(request: Request): Promise<AdminGuardResult> {
  try {
    const session = await getAdminSessionFromRequest(request);

    if (!session) {
      return {
        session: null,
        response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      };
    }

    return { session, response: null };
  } catch (error) {
    return {
      session: null,
      response: NextResponse.json(
        { message: getDatabaseErrorMessage(error) || "Unable to verify admin session." },
        { status: getDatabaseErrorStatus(error) }
      ),
    };
  }
}
