import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "../../../../../src/lib/adminAuth";
import { listSupabaseObjects, createSignedSupabaseObjectUrls } from "../../../../../src/lib/supabaseStorage";
import { getDb } from "../../../../../src/db/index";
import { users, documents } from "../../../../../src/db/schema";
import { desc, eq } from "drizzle-orm";
import { permanentDocumentTypeSet } from "../../../../../src/lib/permanentDocumentTypes";
import { yearlyDocumentSlotSet } from "../../../../../src/lib/yearlyDocumentTypes";

export const runtime = "nodejs";

function hasAdminSession(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return Boolean(verifyAdminSessionToken(token));
}

const querySchema = z.object({
  userId: z.string().uuid(),
  limit: z.string().optional(),
  offset: z.string().optional(),
  category: z.union([z.literal("all"), z.literal("yearly"), z.literal("permanent")]).optional(),
});

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid or missing userId" }, { status: 400 });
  }

  const { userId } = parsed.data;
  const limit = parsed.data.limit ? Math.max(1, Math.min(500, Number(parsed.data.limit))) : 20;
  const offset = parsed.data.offset ? Math.max(0, Number(parsed.data.offset)) : 0;
  const category = parsed.data.category || "all";

  try {
    // Try storage-first: list objects under yearly-documents/{userId} and permanent-documents/{userId}
    const yearlyPrefix = `yearly-documents/${userId}`;
    const permanentPrefix = `permanent-documents/${userId}`;

    try {
      const yearly = category !== "permanent" ? await listSupabaseObjects(yearlyPrefix, { limit, offset }) : [];
      const permanent = category !== "yearly" ? await listSupabaseObjects(permanentPrefix, { limit, offset }) : [];
      const all = [...yearly, ...permanent];

      if (all.length > 0) {
        const entries: Array<any> = [];

        for (const obj of all) {
          const path = String(obj.path || obj.name || "").replace(/^\/+/, "");
          const parts = path.split("/");
          if (parts.length < 3) continue;

          const prefix = parts[0];
          const uid = parts[1];
          if (uid !== userId) continue;

          if (prefix === "yearly-documents" && parts.length >= 4) {
            const yearPart = parts[2];
            const slot = parts[3];
            if (!yearPart || !slot) continue;

            const parsedYear = Number.parseInt(yearPart, 10);
            const year = Number.isNaN(parsedYear) ? null : parsedYear;
            entries.push({
              documentType: slot,
              documentCategory: year !== null ? "yearly" : "general",
              documentYear: year,
              documentSlot: slot,
              fileName: obj.name,
              filePath: path,
              storagePath: path,
              mimeType: obj.metadata?.contentType || null,
              createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
            });
          } else if (prefix === "permanent-documents" && parts.length >= 3) {
            const type = parts[2];
            if (!type) continue;

            entries.push({
              documentType: type,
              documentCategory: permanentDocumentTypeSet.has(type as any) ? "permanent" : "general",
              documentYear: null,
              documentSlot: null,
              fileName: obj.name,
              filePath: path,
              storagePath: path,
              mimeType: obj.metadata?.contentType || null,
              createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
            });
          }
        }

        // Fetch user info
        const db = getDb();
        const [userRow] = await db.select({ id: users.id, name: users.name, email: users.email, mobileNumber: users.mobileNumber }).from(users).where(eq(users.id, userId));

        const signedMap = await createSignedSupabaseObjectUrls(entries.map((e) => e.filePath || e.storagePath), 3600);

        const documentsResult = entries.map((e) => ({
          id: "",
          userId,
          userName: userRow?.name || "(unknown)",
          userEmail: userRow?.email || "",
          userPhone: userRow?.mobileNumber || "",
          documentType: e.documentType,
          documentCategory: e.documentCategory,
          documentYear: e.documentYear,
          documentSlot: e.documentSlot,
          fileName: e.fileName,
          filePath: String(e.filePath || e.storagePath || "").replace(/^\/+/, ""),
          signedUrl: signedMap[String(e.filePath || e.storagePath || "")] || null,
          mimeType: e.mimeType || null,
          createdAt: e.createdAt,
        }));

        return NextResponse.json({
          user: { id: userId, name: userRow?.name || "(unknown)", email: userRow?.email || "", mobileNumber: userRow?.mobileNumber || "" },
          documents: documentsResult,
          nextOffsets: {
            yearly: yearly.length === limit ? offset + yearly.length : null,
            permanent: permanent.length === limit ? offset + permanent.length : null,
          },
        });
      }
    } catch (err) {
      console.warn("[api/admin/user-documents] storage listing failed, falling back to DB", err);
    }

    // Fallback to DB query
    const db = getDb();

    const rows = await db
      .select({
        id: documents.id,
        documentType: documents.documentType,
        documentYear: documents.documentYear,
        documentSlot: documents.documentSlot,
        fileName: documents.fileName,
        filePath: documents.fileUrl,
        storagePath: documents.storagePath,
        mimeType: documents.mimeType,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(eq(documents.userId, userId))
      .orderBy(desc(documents.createdAt));

    const [userRow] = await db.select({ id: users.id, name: users.name, email: users.email, mobileNumber: users.mobileNumber }).from(users).where(eq(users.id, userId));

    const signedMap = await createSignedSupabaseObjectUrls(rows.map((r) => r.filePath || r.storagePath), 3600);

    const documentsResult = rows.map((row: any) => ({
      id: row.id,
      userId,
      userName: userRow?.name || "(unknown)",
      userEmail: userRow?.email || "",
      userPhone: userRow?.mobileNumber || "",
      documentType: row.documentType,
      documentCategory: row.documentYear !== null && row.documentSlot !== null && yearlyDocumentSlotSet.has(row.documentSlot) ? "yearly" : permanentDocumentTypeSet.has(row.documentType as any) ? "permanent" : "general",
      documentYear: row.documentYear,
      documentSlot: row.documentSlot,
      fileName: row.fileName,
      filePath: String(row.filePath || row.storagePath || "").replace(/^\/+/, ""),
      signedUrl: signedMap[String(row.filePath || row.storagePath || "")] || null,
      mimeType: row.mimeType,
      createdAt: row.createdAt ? row.createdAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ user: { id: userId, name: userRow?.name || "(unknown)", email: userRow?.email || "", mobileNumber: userRow?.mobileNumber || "" }, documents: documentsResult, nextOffsets: { yearly: null, permanent: null } });
  } catch (error) {
    console.error("[api/admin/user-documents] GET failed", error);
    return NextResponse.json({ message: "Unable to load user documents." }, { status: 500 });
  }
}
