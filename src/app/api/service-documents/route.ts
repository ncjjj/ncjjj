import { and, desc, eq, like } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { getDb } from "../../../db/index";
import { documents } from "../../../db/schema";
import { findUserById } from "../../../db/queries/users";
import { deleteAppwriteObjects, resolveAppwriteObjectUrl } from "../../../lib/appwriteStorage";
import { emitAdminEvent, emitUserEvent } from "../../../lib/consultationRequestSocket";
import { decodeServiceAccess, getDashboardServiceSectionByTypeKey } from "../../../lib/serviceAccess";
import {
  isFinancialYearAtLeast,
  minServiceFinancialYearStartYear,
} from "../../../lib/yearlyDocumentTypes";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await findUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const typeKey = String(searchParams.get("typeKey") || "").trim().toLowerCase();
    const financialYear = String(searchParams.get("financialYear") || "").trim();

    if (!typeKey) {
      return NextResponse.json({ message: "Document type is required." }, { status: 400 });
    }

    const section = getDashboardServiceSectionByTypeKey(typeKey);
    const serviceKey = typeKey.split(":")[0] || "";

    if (!section || !serviceKey) {
      return NextResponse.json({ message: "Service document section is invalid." }, { status: 400 });
    }

    if (!decodeServiceAccess(user.serviceAccess).includes(serviceKey)) {
      return NextResponse.json(
        { message: "You do not have access to this service document section." },
        { status: 403 }
      );
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

    const visibleRows = section?.requiresFinancialYear
      ? rows.filter((row) => isFinancialYearAtLeast(row.documentSlot, minServiceFinancialYearStartYear))
      : rows;
    const isLocked = visibleRows.some((row) => row.uploadStatus === "completed");

    const resolvedUrls = await Promise.all(
      visibleRows.map(async (row) => {
        let viewUrl: string | null = null;

        try {
          const resolved = await resolveAppwriteObjectUrl({ path: row.storagePath, expiresIn: 3600 });
          viewUrl = resolved.avatarUrl;
        } catch (error) {
          console.warn("[api/service-documents] failed to resolve document URL", {
            documentId: row.id,
            error,
          });
        }

        return {
          id: row.id,
          fileName: row.fileName,
          documentName: row.uploadDescription || row.fileName,
          financialYear: row.documentSlot,
          uploadStatus: row.uploadStatus,
          createdAt: row.createdAt,
          viewUrl,
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

    await deleteAppwriteObjects([documentRow.storagePath]);

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
