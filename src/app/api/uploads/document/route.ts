import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { authOptions } from "../../../../lib/auth";
import { createDocument } from "../../../../db/queries/documents";
import {
  createSignedSupabaseObjectUrl,
  uploadFileToSupabase,
} from "../../../../lib/supabaseStorage";
import { emitToAdminRoom } from "../../../../lib/socketServer";

const allowedDocumentTypes = [
  "Aadhaar Card",
  "PAN Card",
  "Passport Size Photo",
  "Signature",
  "Driving License",
  "Voter ID",
  "Utility Bill",
  "GST Certificate",
  "Bank Statement",
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = formData.get("documentType");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Document file is required." }, { status: 400 });
    }

    if (typeof documentType !== "string" || !allowedDocumentTypes.includes(documentType)) {
      return NextResponse.json({ message: "Invalid document type." }, { status: 400 });
    }

    const uploaded = await uploadFileToSupabase({
      file,
      folder: `documents/${session.user.id}/${documentType.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    });

    const savedDocument = await createDocument({
      userId: session.user.id,
      documentType,
      fileName: uploaded.fileName,
      filePath: uploaded.path,
      storagePath: uploaded.path,
      mimeType: uploaded.mimeType,
    });

    if (!savedDocument) {
      return NextResponse.json({ message: "Unable to save document." }, { status: 500 });
    }

    let documentSignedUrl = null;

    try {
      documentSignedUrl = await createSignedSupabaseObjectUrl({
        path: uploaded.path,
        expiresIn: 3600,
      });
    } catch (error) {
      console.warn("[uploads/document] signed URL generation failed", error);
    }

    emitToAdminRoom("documentsUpdated", {
      eventId: randomUUID(),
      userId: session.user.id,
      documentType: savedDocument.documentType,
      documentCategory: "general",
      occurredAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id: savedDocument.id,
      documentType: savedDocument.documentType,
      fileName: savedDocument.fileName,
      documentPath: savedDocument.filePath,
      documentSignedUrl,
      storagePath: savedDocument.storagePath,
      mimeType: savedDocument.mimeType,
      createdAt: savedDocument.createdAt,
    });
  } catch (error: unknown) {
    console.error("[uploads/document] failed", error);

    return NextResponse.json(
      { message: getErrorMessage(error) || "Unable to upload document." },
      { status: 500 }
    );
  }
}
