import { and, desc, eq, like } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { getDb } from "../../../db/index";
import { documents } from "../../../db/schema";
import { deleteSupabaseObjects, resolveSupabaseObjectUrl } from "../../../lib/supabaseStorage";
import { emitAdminEvent, emitUserEvent } from "../../../lib/consultationRequestSocket";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const typeKey = String(searchParams.get("typeKey") || "").trim().toLowerCase();
    const financialYear = String(searchParams.get("financialYear") || "").trim();

    if (!typeKey) {
      return NextResponse.json({ message: "Document type is required." }, { status: 400 });
    }

    const db = getDb();

    const conditions = [
      eq(documents.userId, session.user.id),
      eq(documents.documentType, `service:${typeKey}`),
      like(documents.documentType, "service:%"),
    ];

    if (financialYear) {
      conditions.push(eq(documents.documentSlot, financialYear));
    }

    const rows = await db
      .select({
        id: documents.id,
        fileName: documents.fileName,
        storagePath: documents.storagePath,
        documentSlot: documents.documentSlot,
        uploadDescription: documents.uploadDescription,
        uploadStatus: documents.uploadStatus,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));

    const isLocked = rows.some((row) => row.uploadStatus === "completed");

    const resolvedUrls = await Promise.all(
      rows.map(async (row) => {
        const resolved = await resolveSupabaseObjectUrl({ path: row.storagePath, expiresIn: 3600 });

        return {
          id: row.id,
          fileName: row.fileName,
          documentName: row.uploadDescription || row.fileName,
          financialYear: row.documentSlot,
          uploadStatus: row.uploadStatus,
          createdAt: row.createdAt,
          viewUrl: resolved.avatarUrl,
        };
      })
    );

    return NextResponse.json({ documents: resolvedUrls, locked: isLocked });
  } catch (error) {
    console.error("[api/service-documents] GET failed", error);
    return NextResponse.json({ message: "Unable to load service documents." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => null)) as { documentId?: string } | null;

    if (!body?.documentId) {
      return NextResponse.json({ message: "Document id is required." }, { status: 400 });
    }

    const db = getDb();
    const [documentRow] = await db
      .select({
        id: documents.id,
        storagePath: documents.storagePath,
        documentType: documents.documentType,
        uploadStatus: documents.uploadStatus,
      })
      .from(documents)
      .where(and(eq(documents.id, body.documentId), eq(documents.userId, session.user.id)))
      .limit(1);

    if (!documentRow || !documentRow.documentType.startsWith("service:")) {
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    if (documentRow.uploadStatus === "completed") {
      return NextResponse.json(
        { message: "Completed service documents cannot be deleted." },
        { status: 423 }
      );
    }

    await deleteSupabaseObjects([documentRow.storagePath]);

    await db
      .delete(documents)
      .where(and(eq(documents.id, body.documentId), eq(documents.userId, session.user.id)));

    emitAdminEvent("document-deleted", {
      userId: session.user.id,
      email: session.user.email,
      documentId: body.documentId,
    });

    if (session.user.email) {
      emitUserEvent(session.user.email, "document-deleted", {
        documentId: body.documentId,
      });
    }

    return NextResponse.json({ message: "Document deleted successfully." });
  } catch (error) {
    console.error("[api/service-documents] DELETE failed", error);
    return NextResponse.json({ message: "Unable to delete service document." }, { status: 500 });
  }
}
