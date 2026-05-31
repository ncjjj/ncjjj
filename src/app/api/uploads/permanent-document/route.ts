import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "../../../../lib/auth";
import {
  createPermanentDocument,
  getPermanentDocumentForUser,
  updatePermanentDocument,
} from "../../../../db/queries/permanentDocuments";
import {
  isAllowedPermanentDocumentMimeType,
  maxPermanentDocumentSizeBytes,
  permanentDocumentTypeSet,
  type PermanentDocumentType,
} from "../../../../lib/permanentDocumentTypes";
import {
  deleteSupabaseObjects,
  resolveSupabaseObjectUrl,
  uploadFileToSupabase,
} from "../../../../lib/supabaseStorage";
import { emitAdminEvent } from "../../../../lib/consultationRequestSocket";

function sanitizeText(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length ? text : null;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let uploadedPath: string | null = null;

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const rawDocumentType = String(formData.get("documentType") || "").trim().toLowerCase();

    if (!(fileEntry instanceof Blob)) {
      return NextResponse.json({ message: "Document file is required." }, { status: 400 });
    }

    if (!permanentDocumentTypeSet.has(rawDocumentType as PermanentDocumentType)) {
      return NextResponse.json({ message: "Invalid permanent document type." }, { status: 400 });
    }

    const documentType = rawDocumentType as PermanentDocumentType;
    const fileName = "name" in fileEntry && typeof fileEntry.name === "string"
      ? fileEntry.name
      : `${documentType}-document`;
    const fileType = typeof fileEntry.type === "string" ? fileEntry.type : "application/octet-stream";
    const fileSize = typeof fileEntry.size === "number" ? fileEntry.size : 0;

    if (!isAllowedPermanentDocumentMimeType(fileType)) {
      return NextResponse.json(
        { message: "Only PDF and image files are allowed." },
        { status: 400 }
      );
    }

    if (fileSize > maxPermanentDocumentSizeBytes) {
      return NextResponse.json(
        { message: "File size exceeds permanent document limit." },
        { status: 400 }
      );
    }

    const file = new File([fileEntry], fileName, { type: fileType });

    const uploaded = await uploadFileToSupabase({
      file,
      folder: `permanent-documents/${session.user.id}/${documentType}`,
    });
    uploadedPath = uploaded.path;

    const existing = await getPermanentDocumentForUser(session.user.id, documentType);

    const payload = {
      fileName,
      fileUrl: uploaded.path,
      storagePath: uploaded.path,
      mimeType: fileType,
      aadharNumber: sanitizeText(formData.get("aadharNumber")),
      panNumber: sanitizeText(formData.get("panNumber")),
      accountNumber: sanitizeText(formData.get("accountNumber")),
      gstNumber: sanitizeText(formData.get("gstNumber")),
    };

    const saved = existing
      ? await updatePermanentDocument(existing.id, payload)
      : await createPermanentDocument({
          userId: session.user.id,
          documentType,
          ...payload,
        });

    if (existing?.storagePath && existing.storagePath !== uploaded.path) {
      await deleteSupabaseObjects([existing.storagePath]);
    }

    const resolved = await resolveSupabaseObjectUrl({
      path: saved.storagePath,
      expiresIn: 3600,
    });

    uploadedPath = null;

    emitAdminEvent("document-uploaded", {
      userId: session.user.id,
      email: session.user.email,
      documentType: `permanent:${saved.documentType}`,
      fileName: saved.fileName,
    });

    return NextResponse.json({
      message: "Permanent document uploaded successfully.",
      document: {
        ...saved,
        signedUrl: resolved.avatarUrl,
        documentSignedUrl: resolved.avatarUrl,
      },
    });
  } catch (error) {
    if (uploadedPath) {
      try {
        await deleteSupabaseObjects([uploadedPath]);
      } catch (rollbackError) {
        console.warn("[api/uploads/permanent-document] rollback failed", rollbackError);
      }
    }

    console.error("[api/uploads/permanent-document] POST failed", error);
    return NextResponse.json(
      { message: "Unable to upload permanent document." },
      { status: 500 }
    );
  }
}
