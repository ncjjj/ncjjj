import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { authOptions } from "../../../../lib/auth";
import {
  createPermanentDocument,
  getPermanentDocumentForUser,
  updatePermanentDocument,
} from "../../../../db/queries/permanentDocuments";
import {
  deleteSupabaseObjects,
  createSignedSupabaseObjectUrl,
  uploadFileToSupabase,
} from "../../../../lib/supabaseStorage";
import {
  getPermanentDocumentDescription,
  getPermanentDocumentLabel,
  isAllowedPermanentDocumentMimeType,
  maxPermanentDocumentSizeBytes,
  permanentDocumentTypeSet,
  type PermanentDocumentType,
} from "../../../../lib/permanentDocumentTypes";
import { emitToAdminRoom } from "../../../../lib/socketServer";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

function normalizeDocumentType(value: FormDataEntryValue | null): PermanentDocumentType | null {
  if (
    typeof value !== "string" ||
    !permanentDocumentTypeSet.has(value as PermanentDocumentType)
  ) {
    return null;
  }

  return value as PermanentDocumentType;
}

function getOptionalText(formData: FormData, fieldName: string): string | null {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = normalizeDocumentType(formData.get("documentType"));
    const documentDetails = {
      aadharNumber: getOptionalText(formData, "aadharNumber"),
      panNumber: getOptionalText(formData, "panNumber"),
      accountNumber: getOptionalText(formData, "accountNumber"),
      gstNumber: getOptionalText(formData, "gstNumber"),
      uploadDescription: getOptionalText(formData, "uploadDescription"),
    };

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Document file is required." }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ message: "Valid document type is required." }, { status: 400 });
    }

    if (!isAllowedPermanentDocumentMimeType(file.type || "application/octet-stream")) {
      return NextResponse.json(
        { message: "This file type is not supported." },
        { status: 400 }
      );
    }

    if (file.size > maxPermanentDocumentSizeBytes) {
      return NextResponse.json(
        { message: "File size must be 50 MB or smaller." },
        { status: 400 }
      );
    }

    const existingDocument = await getPermanentDocumentForUser(session.user.id, documentType);

    const uploaded = await uploadFileToSupabase({
      file,
      folder: `permanent-documents/${session.user.id}/${documentType}`,
    });

    const savedDocument = existingDocument
      ? await updatePermanentDocument(existingDocument.id, {
          fileName: uploaded.fileName,
          fileUrl: uploaded.path,
          storagePath: uploaded.path,
          mimeType: uploaded.mimeType,
          ...documentDetails,
        })
      : await createPermanentDocument({
          userId: session.user.id,
          documentType,
          fileName: uploaded.fileName,
          fileUrl: uploaded.path,
          storagePath: uploaded.path,
          mimeType: uploaded.mimeType,
          ...documentDetails,
        });

    if (!savedDocument) {
      return NextResponse.json({ message: "Unable to save document." }, { status: 500 });
    }

    if (existingDocument && existingDocument.storagePath !== uploaded.path) {
      try {
        await deleteSupabaseObjects([existingDocument.storagePath]);
      } catch (cleanupError) {
        console.warn("[uploads/permanent-document] cleanup failed", cleanupError);
      }
    }

    let documentSignedUrl = null;

    try {
      documentSignedUrl = await createSignedSupabaseObjectUrl({
        path: uploaded.path,
        expiresIn: 3600,
      });
    } catch (error) {
      console.warn("[uploads/permanent-document] signed URL generation failed", error);
    }

    emitToAdminRoom("documentsUpdated", {
      eventId: randomUUID(),
      userId: session.user.id,
      documentType: savedDocument.documentType,
      documentCategory: "permanent",
      occurredAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id: savedDocument.id,
      documentType: savedDocument.documentType,
      documentLabel: getPermanentDocumentLabel(savedDocument.documentType),
      documentDescription: getPermanentDocumentDescription(savedDocument.documentType),
      fileName: savedDocument.fileName,
      documentUrl: savedDocument.fileUrl,
      documentSignedUrl,
      storagePath: savedDocument.storagePath,
      mimeType: savedDocument.mimeType,
      aadharNumber: savedDocument.aadharNumber,
      panNumber: savedDocument.panNumber,
      accountNumber: savedDocument.accountNumber,
      gstNumber: savedDocument.gstNumber,
      uploadDescription: savedDocument.uploadDescription,
      createdAt: savedDocument.createdAt,
    });
  } catch (error: unknown) {
    console.error("[uploads/permanent-document] failed", error);

    return NextResponse.json(
      { message: getErrorMessage(error) || "Unable to upload document." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const documentType = normalizeDocumentType(searchParams.get("documentType"));

    if (!documentType) {
      return NextResponse.json({ message: "Valid document type is required." }, { status: 400 });
    }

    const document = await getPermanentDocumentForUser(session.user.id, documentType);

    if (!document) {
      return NextResponse.json(null);
    }

    let documentSignedUrl = null;

    try {
      documentSignedUrl = await createSignedSupabaseObjectUrl({
        path: document.storagePath,
        expiresIn: 3600,
      });
    } catch (error) {
      console.warn("[uploads/permanent-document] signed URL generation failed", error);
    }

    return NextResponse.json({
      id: document.id,
      documentType: document.documentType,
      documentLabel: getPermanentDocumentLabel(document.documentType),
      documentDescription: getPermanentDocumentDescription(document.documentType),
      fileName: document.fileName,
      documentUrl: document.fileUrl,
      documentSignedUrl,
      storagePath: document.storagePath,
      mimeType: document.mimeType,
      aadharNumber: document.aadharNumber,
      panNumber: document.panNumber,
      accountNumber: document.accountNumber,
      gstNumber: document.gstNumber,
      uploadDescription: document.uploadDescription,
      createdAt: document.createdAt,
    });
  } catch (error: unknown) {
    console.error("[uploads/permanent-document] GET failed", error);

    return NextResponse.json(
      { message: getErrorMessage(error) || "Unable to fetch document." },
      { status: 500 }
    );
  }
}
