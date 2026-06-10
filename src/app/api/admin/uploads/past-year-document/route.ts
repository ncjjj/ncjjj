import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "../../../../../lib/adminRequestSession";
import {
  createYearlyDocument,
  getYearlyDocumentForUser,
  updateYearlyDocument,
} from "../../../../../db/queries/yearlyDocuments";
import {
  isAllowedYearlyDocumentMimeType,
  maxYearlyDocumentSizeBytes,
  normalizeYearlyDocumentYear,
  yearlyDocumentSlotSet,
  type YearlyDocumentSlot,
} from "../../../../../lib/yearlyDocumentTypes";
import {
  deleteAppwriteObjects,
  resolveAppwriteObjectUrl,
  uploadFileToAppwrite,
} from "../../../../../lib/appwriteStorage";
import { getDb } from "../../../../../db/index";
import { users } from "../../../../../db/schema";
import { eq } from "drizzle-orm";
import { emitAdminEvent, emitUserEvent } from "../../../../../lib/consultationRequestSocket";

function getFileError(fileType: string, fileSize: number): string | null {
  if (!isAllowedYearlyDocumentMimeType(fileType)) {
    return "Only PDF and image files are allowed.";
  }

  if (fileSize > maxYearlyDocumentSizeBytes) {
    return "File size exceeds yearly document limit.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  const adminSession = await getAdminSessionFromRequest(request);

  if (!adminSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let uploadedPath: string | null = null;

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const userId = String(formData.get("userId") || "").trim();
    const year = normalizeYearlyDocumentYear(formData.get("year"));
    const documentSlotValue = String(formData.get("documentSlot") || "").trim();

    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    if (!(fileEntry instanceof Blob)) {
      return NextResponse.json({ message: "Document file is required." }, { status: 400 });
    }

    if (!year) {
      return NextResponse.json({ message: "Valid year is required." }, { status: 400 });
    }

    if (!yearlyDocumentSlotSet.has(documentSlotValue as YearlyDocumentSlot)) {
      return NextResponse.json({ message: "Valid document slot is required." }, { status: 400 });
    }

    const documentSlot = documentSlotValue as YearlyDocumentSlot;
    const fileName = "name" in fileEntry && typeof fileEntry.name === "string"
      ? fileEntry.name
      : `${documentSlot}-${year}`;
    const fileType = typeof fileEntry.type === "string" ? fileEntry.type : "application/octet-stream";
    const fileSize = typeof fileEntry.size === "number" ? fileEntry.size : 0;

    const validationError = getFileError(fileType, fileSize);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const file = new File([fileEntry], fileName, { type: fileType });

    const uploaded = await uploadFileToAppwrite({
      file,
      folder: `yearly-documents/${userId}/${year}/${documentSlot}`,
    });
    uploadedPath = uploaded.path;

    const existing = await getYearlyDocumentForUser(userId, year, documentSlot);

    const saved = existing
      ? await updateYearlyDocument(existing.id, {
          fileName,
          filePath: uploaded.path,
          storagePath: uploaded.path,
          mimeType: fileType,
        })
      : await createYearlyDocument({
          userId,
          documentYear: year,
          documentSlot,
          fileName,
          filePath: uploaded.path,
          storagePath: uploaded.path,
          mimeType: fileType,
        });

    if (!saved) {
      throw new Error("Unable to save yearly document metadata.");
    }

    if (existing?.storagePath && existing.storagePath !== uploaded.path) {
      await deleteAppwriteObjects([existing.storagePath]);
    }

    const resolved = await resolveAppwriteObjectUrl({
      path: saved.storagePath,
      expiresIn: 3600,
    });

    uploadedPath = null;

    const db = getDb();
    const targetUser = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (targetUser?.email) {
      emitUserEvent(targetUser.email, "document-uploaded", {
        documentType: `yearly:${saved.documentSlot}`,
        documentYear: saved.documentYear,
        documentSlot: saved.documentSlot,
        fileName: saved.fileName,
      });
    }

    emitAdminEvent("document-uploaded", {
      userId,
      documentType: `yearly:${saved.documentSlot}`,
      documentYear: saved.documentYear,
      documentSlot: saved.documentSlot,
      fileName: saved.fileName,
    });

    return NextResponse.json({
      message: "Yearly document uploaded successfully.",
      document: {
        id: saved.id,
        documentYear: saved.documentYear,
        documentSlot: saved.documentSlot,
        fileName: saved.fileName,
        filePath: saved.filePath,
        storagePath: saved.storagePath,
        signedUrl: resolved.avatarUrl,
        mimeType: saved.mimeType,
        createdAt: saved.createdAt,
      },
    });
  } catch (error) {
    if (uploadedPath) {
      try {
        await deleteAppwriteObjects([uploadedPath]);
      } catch (rollbackError) {
        console.warn("[api/admin/uploads/past-year-document] rollback failed", rollbackError);
      }
    }

    console.error("[api/admin/uploads/past-year-document] POST failed", error);
    return NextResponse.json(
      { message: "Unable to upload yearly document." },
      { status: 500 }
    );
  }
}
