import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { createDocument } from "../../../../db/queries/documents";
import { isAllowedDocumentMimeType } from "../../../../lib/documentFiles";
import {
  deleteAppwriteObjects,
  resolveAppwriteObjectUrl,
  uploadFileToAppwrite,
} from "../../../../lib/appwriteStorage";
import { emitAdminEvent, emitUserEvent } from "../../../../lib/consultationRequestSocket";

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024 * 1024; // 10GB limit

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let uploadedPath: string | null = null;

  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const documentType = String(formData.get("documentType") || "").trim();

    if (!(fileEntry instanceof Blob)) {
      return NextResponse.json({ message: "Document file is required." }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ message: "Document type is required." }, { status: 400 });
    }

    const fileName = "name" in fileEntry && typeof fileEntry.name === "string"
      ? fileEntry.name
      : "document";
    const fileType = typeof fileEntry.type === "string" ? fileEntry.type : "application/octet-stream";
    const fileSize = typeof fileEntry.size === "number" ? fileEntry.size : 0;

    if (!isAllowedDocumentMimeType(fileType)) {
      return NextResponse.json({ message: "Unsupported file type." }, { status: 400 });
    }

    if (fileSize > MAX_DOCUMENT_SIZE_BYTES) {
      return NextResponse.json({ message: "File size exceeds 10MB limit." }, { status: 400 });
    }

    const file = new File([fileEntry], fileName, { type: fileType });
    const safeTypeFolder = documentType.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const uploaded = await uploadFileToAppwrite({
      file,
      folder: `documents/${session.user.id}/${safeTypeFolder}`,
    });
    uploadedPath = uploaded.path;

    const saved = await createDocument({
      userId: session.user.id,
      uploadedByUserId: session.user.id,
      documentType,
      fileName,
      filePath: uploaded.path,
      storagePath: uploaded.path,
      mimeType: fileType,
    });

    if (!saved) {
      throw new Error("Unable to save document metadata.");
    }

    const resolved = await resolveAppwriteObjectUrl({
      path: saved.storagePath,
      expiresIn: 3600,
    });

    uploadedPath = null;

    emitAdminEvent("document-uploaded", {
      userId: session.user.id,
      email: session.user.email,
      documentType: saved.documentType,
      fileName: saved.fileName,
    });

    if (session.user.email) {
      emitUserEvent(session.user.email, "document-uploaded", {
        documentType: saved.documentType,
      });
    }

    return NextResponse.json({
      message: "Document uploaded successfully.",
      id: saved.id,
      fileName: saved.fileName,
      documentType: saved.documentType,
      documentSignedUrl: resolved.avatarUrl,
    });
  } catch (error) {
    if (uploadedPath) {
      try {
        await deleteAppwriteObjects([uploadedPath]);
      } catch (rollbackError) {
        console.warn("[api/uploads/document] rollback failed", rollbackError);
      }
    }

    console.error("[api/uploads/document] POST failed", error);
    return NextResponse.json(
      { message: "Unable to upload document." },
      { status: 500 }
    );
  }
}
