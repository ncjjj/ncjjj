import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { authOptions } from "../../../lib/auth";
import {
  getPermanentDocumentForUser,
  getPermanentDocumentNumbers,
  listPermanentDocumentsForUser,
  updatePermanentDocument,
  type PermanentDocumentRecord,
  type UpdatePermanentDocumentInput,
} from "../../../db/queries/permanentDocuments";
import {
  getPermanentDocumentDescription,
  getPermanentDocumentLabel,
  permanentDocumentTypeSet,
  type PermanentDocumentType,
} from "../../../lib/permanentDocumentTypes";
import { createSignedSupabaseObjectUrls } from "../../../lib/supabaseStorage";
import { emitToAdminRoom } from "../../../lib/socketServer";

function normalizeDocumentType(value: unknown): PermanentDocumentType | null {
  if (typeof value !== "string" || !permanentDocumentTypeSet.has(value as PermanentDocumentType)) {
    return null;
  }

  return value as PermanentDocumentType;
}

function readOptionalText(body: Record<string, unknown>, fieldName: string): string | null | undefined {
  if (!Object.prototype.hasOwnProperty.call(body, fieldName)) {
    return undefined;
  }

  const value = body[fieldName];

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || null;
}

function serializeDocument(
  document: PermanentDocumentRecord,
  signedMap: Record<string, string | null> = {}
) {
  const normalizedPath = String(document.storagePath || document.fileUrl || "").replace(/^\/+/, "");
  const signedUrl = signedMap[normalizedPath] || null;

  return {
    id: document.id,
    documentType: document.documentType,
    documentLabel: getPermanentDocumentLabel(document.documentType),
    documentDescription: getPermanentDocumentDescription(document.documentType),
    fileName: document.fileName,
    fileUrl: normalizedPath,
    storagePath: normalizedPath,
    signedUrl,
    documentSignedUrl: signedUrl,
    mimeType: document.mimeType,
    aadharNumber: document.aadharNumber,
    panNumber: document.panNumber,
    accountNumber: document.accountNumber,
    gstNumber: document.gstNumber,
    uploadDescription: document.uploadDescription,
    createdAt: document.createdAt,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const permanentDocuments = await listPermanentDocumentsForUser(session.user.id);
    const signedMap = await createSignedSupabaseObjectUrls(
      permanentDocuments.map((item) => item.storagePath || item.fileUrl),
      3600
    );

    return NextResponse.json({
      documents: permanentDocuments.map((document) => serializeDocument(document, signedMap)),
      numbers: getPermanentDocumentNumbers(permanentDocuments),
    });
  } catch (error) {
    console.error("[api/permanent-documents] GET failed", error);
    return NextResponse.json({ message: "Unable to load permanent documents." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const documentType = normalizeDocumentType(body.documentType);

    if (!documentType) {
      return NextResponse.json({ message: "Valid document type is required." }, { status: 400 });
    }

    const input: UpdatePermanentDocumentInput = {};
    const aadharNumber = readOptionalText(body, "aadharNumber");
    const panNumber = readOptionalText(body, "panNumber");
    const accountNumber = readOptionalText(body, "accountNumber");
    const gstNumber = readOptionalText(body, "gstNumber");
    const uploadDescription = readOptionalText(body, "uploadDescription");

    if (aadharNumber !== undefined) {
      input.aadharNumber = aadharNumber;
    }
    if (panNumber !== undefined) {
      input.panNumber = panNumber;
    }
    if (accountNumber !== undefined) {
      input.accountNumber = accountNumber;
    }
    if (gstNumber !== undefined) {
      input.gstNumber = gstNumber;
    }
    if (uploadDescription !== undefined) {
      input.uploadDescription = uploadDescription;
    }

    if (Object.keys(input).length === 0) {
      return NextResponse.json({ message: "No document details were provided." }, { status: 400 });
    }

    const existingDocument = await getPermanentDocumentForUser(session.user.id, documentType);

    if (!existingDocument) {
      return NextResponse.json(
        { message: "Upload this document before updating its saved details." },
        { status: 404 }
      );
    }

    const updatedDocument = await updatePermanentDocument(existingDocument.id, input);
    const signedMap = await createSignedSupabaseObjectUrls([updatedDocument.storagePath], 3600);

    emitToAdminRoom("documentsUpdated", {
      eventId: randomUUID(),
      userId: session.user.id,
      documentType: updatedDocument.documentType,
      documentCategory: "permanent",
      occurredAt: new Date().toISOString(),
    });

    return NextResponse.json({ document: serializeDocument(updatedDocument, signedMap) });
  } catch (error) {
    console.error("[api/permanent-documents] PATCH failed", error);
    return NextResponse.json({ message: "Unable to update document details." }, { status: 500 });
  }
}
