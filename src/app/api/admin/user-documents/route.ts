import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "../../../../../src/lib/adminAuth";
import { createSignedSupabaseObjectUrls } from "../../../../../src/lib/supabaseStorage";
import { getDb } from "../../../../../src/db/index";
import { documents, users } from "../../../../../src/db/schema";
import { permanentDocumentTypeSet } from "../../../../../src/lib/permanentDocumentTypes";
import { yearlyDocumentSlotSet } from "../../../../../src/lib/yearlyDocumentTypes";

export const runtime = "nodejs";

type DocumentCategory = "general" | "yearly" | "permanent";

type UserDocumentRow = {
  id: string;
  documentType: string;
  documentYear: number | null;
  documentSlot: string | null;
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
  accountNumber: string | null;
  gstNumber: string | null;
  uploadDescription: string | null;
  createdAt: Date;
};

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

const permanentDocumentTypeValues = Array.from(permanentDocumentTypeSet);

function getDocumentCategory(row: UserDocumentRow): DocumentCategory {
  if (
    row.documentYear !== null &&
    row.documentSlot !== null &&
    yearlyDocumentSlotSet.has(row.documentSlot as any)
  ) {
    return "yearly";
  }

  if (permanentDocumentTypeSet.has(row.documentType as any)) {
    return "permanent";
  }

  return "general";
}

function matchesCategory(row: UserDocumentRow, category: "all" | "yearly" | "permanent") {
  return category === "all" || getDocumentCategory(row) === category;
}

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
    const db = getDb();

    const [userRow] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        mobileNumber: users.mobileNumber,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRow) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const whereClause =
      category === "yearly"
        ? and(
            eq(documents.userId, userId),
            isNotNull(documents.documentYear),
            isNotNull(documents.documentSlot)
          )
        : category === "permanent"
          ? and(
              eq(documents.userId, userId),
              isNull(documents.documentYear),
              isNull(documents.documentSlot),
              inArray(documents.documentType, permanentDocumentTypeValues)
            )
          : eq(documents.userId, userId);

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
        aadharNumber: documents.aadharNumber,
        panNumber: documents.panNumber,
        accountNumber: documents.accountNumber,
        gstNumber: documents.gstNumber,
        uploadDescription: documents.uploadDescription,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(whereClause)
      .orderBy(desc(documents.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const visibleRows = (rows as UserDocumentRow[]).filter((row) => matchesCategory(row, category));
    const pageRows = visibleRows.slice(0, limit);
    const signedMap = await createSignedSupabaseObjectUrls(
      pageRows.map((row) => row.filePath || row.storagePath),
      3600
    );

    const documentsResult = pageRows.map((row) => {
      const normalizedPath = String(row.filePath || row.storagePath || "").replace(/^\/+/, "");

      return {
        id: row.id,
        userId,
        userName: userRow.name,
        userEmail: userRow.email,
        userPhone: userRow.mobileNumber,
        documentType: row.documentType,
        documentCategory: getDocumentCategory(row),
        documentYear: row.documentYear,
        documentSlot: row.documentSlot,
        fileName: row.fileName,
        filePath: normalizedPath,
        signedUrl: signedMap[normalizedPath] || null,
        mimeType: row.mimeType,
        aadharNumber: row.aadharNumber,
        panNumber: row.panNumber,
        accountNumber: row.accountNumber,
        gstNumber: row.gstNumber,
        uploadDescription: row.uploadDescription,
        createdAt: row.createdAt.toISOString(),
      };
    });

    const nextOffset = visibleRows.length > limit ? offset + limit : null;

    return NextResponse.json({
      user: userRow,
      documents: documentsResult,
      nextOffsets: {
        yearly: category === "all" || category === "yearly" ? nextOffset : null,
        permanent: category === "all" || category === "permanent" ? nextOffset : null,
      },
    });
  } catch (error) {
    console.error("[api/admin/user-documents] GET failed", error);
    return NextResponse.json({ message: "Unable to load user documents." }, { status: 500 });
  }
}
