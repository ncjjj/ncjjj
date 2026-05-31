import { and, desc, eq, isNotNull, isNull, like } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "../../../../db/index";
import { documents } from "../../../../db/schema";
import { resolveSupabaseObjectUrl } from "../../../../lib/supabaseStorage";
import { getAdminSessionFromRequest } from "../../../../lib/adminRequestSession";

function isCategory(value: string): value is "all" | "service" | "permanent" | "yearly" {
  return ["all", "service", "permanent", "yearly"].includes(value);
}

export async function GET(request: Request) {
  const adminSession = await getAdminSessionFromRequest(request);

  if (!adminSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = String(searchParams.get("userId") || "").trim();
    const categoryInput = String(searchParams.get("category") || "all").trim().toLowerCase();
    const category = isCategory(categoryInput) ? categoryInput : "all";

    const filters = [] as any[];

    if (userId) {
      filters.push(eq(documents.userId, userId));
    }

    if (category === "service") {
      filters.push(like(documents.documentType, "service:%"));
    } else if (category === "permanent") {
      filters.push(isNull(documents.documentYear));
      filters.push(isNull(documents.documentSlot));
    } else if (category === "yearly") {
      filters.push(isNotNull(documents.documentYear));
      filters.push(isNotNull(documents.documentSlot));
    }

    const db = getDb();
    const rows = await db
      .select({
        id: documents.id,
        userId: documents.userId,
        documentType: documents.documentType,
        documentYear: documents.documentYear,
        documentSlot: documents.documentSlot,
        fileName: documents.fileName,
        fileUrl: documents.fileUrl,
        storagePath: documents.storagePath,
        mimeType: documents.mimeType,
        uploadStatus: documents.uploadStatus,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(documents.createdAt));

    const resolvedDocuments = await Promise.all(
      rows.map(async (row) => {
        let signedUrl: string | null = null;

        if (row.storagePath) {
          try {
            const resolved = await resolveSupabaseObjectUrl({
              path: row.storagePath,
              expiresIn: 1800,
            });
            signedUrl = resolved.avatarUrl;
          } catch (error) {
            console.warn("[api/admin/documents] failed to resolve signed URL", {
              documentId: row.id,
              error,
            });
          }
        }

        return {
          ...row,
          signedUrl,
        };
      })
    );

    return NextResponse.json({
      documents: resolvedDocuments,
      requestedBy: {
        adminId: adminSession.adminId,
        username: adminSession.username,
      },
    });
  } catch (error) {
    console.error("[api/admin/documents] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load documents for admin." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const adminSession = await getAdminSessionFromRequest(request);

  if (!adminSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const documentId = String(body?.documentId || "").trim();
    const uploadStatus = String(body?.uploadStatus || "").trim();

    if (!documentId) {
      return NextResponse.json({ message: "Document ID is required." }, { status: 400 });
    }

    if (!uploadStatus) {
      return NextResponse.json({ message: "Upload status is required." }, { status: 400 });
    }

    const db = getDb();
    const updated = await db
      .update(documents)
      .set({ uploadStatus })
      .where(eq(documents.id, documentId))
      .returning({ id: documents.id });

    if (!updated || updated.length === 0) {
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Document status updated successfully." });
  } catch (error) {
    console.error("[api/admin/documents] PATCH failed", error);
    return NextResponse.json(
      { message: "Unable to update document status." },
      { status: 500 }
    );
  }
}
