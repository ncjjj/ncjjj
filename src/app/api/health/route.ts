import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { validateRuntimeEnv } from "../../../lib/env";
import { getDatabaseErrorMessage } from "../../../lib/dbErrors";
import { getDb } from "../../../db/index";

export const dynamic = "force-dynamic";

export async function GET() {
  const envCheck = validateRuntimeEnv();

  if (!envCheck.ok) {
    return NextResponse.json(
      {
        status: "unhealthy",
        env: envCheck,
      },
      { status: 503 }
    );
  }

  try {
    const db = getDb();
    await db.execute(sql`select 1 as ok`);

    return NextResponse.json({
      status: "ok",
      env: {
        ok: true,
        warnings: envCheck.warnings,
      },
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        env: envCheck,
        database: "unavailable",
        message: getDatabaseErrorMessage(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
