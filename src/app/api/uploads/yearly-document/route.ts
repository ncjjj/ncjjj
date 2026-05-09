import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "../../../../lib/auth";
import {
  createYearlyDocument,
  getYearlyDocumentForUser,
  updateYearlyDocument,
} from "../../../../db/queries/yearlyDocuments";
import {
  deleteSupabaseObjects,
  createSignedSupabaseObjectUrl,
  uploadFileToSupabase,
} from "../../../../lib/supabaseStorage";
import {
  getYearlyDocumentDescription,
  getYearlyDocumentLabel,
  isAllowedYearlyDocumentMimeType,
  maxYearlyDocumentSizeBytes,
  normalizeYearlyDocumentYear,
  yearlyDocumentSlotSet,
  type YearlyDocumentSlot,
} from "../../../../lib/yearlyDocumentTypes";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}

function normalizeSlot(value: FormDataEntryValue | null): YearlyDocumentSlot | null {
  if (typeof value !== "string" || !yearlyDocumentSlotSet.has(value as YearlyDocumentSlot)) {
    return null;
  }

  return value as YearlyDocumentSlot;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const yearValue = formData.get("year");
    const documentSlot = normalizeSlot(formData.get("documentSlot"));
    const documentYear = normalizeYearlyDocumentYear(yearValue);

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Document file is required." }, { status: 400 });
    }

    if (!documentYear) {
      return NextResponse.json({ message: "Valid document year is required." }, { status: 400 });
    }

    if (!documentSlot) {
      return NextResponse.json({ message: "Valid document type is required." }, { status: 400 });
    }

    if (!isAllowedYearlyDocumentMimeType(file.type)) {
      return NextResponse.json(
        { message: "Only PDF and image files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > maxYearlyDocumentSizeBytes) {
      return NextResponse.json(
        { message: "File size must be 10 MB or smaller." },
        { status: 400 }
      );
    }

    const existingDocument = await getYearlyDocumentForUser(
      session.user.id,
      documentYear,
      documentSlot
    );

    const uploaded = await uploadFileToSupabase({
      file,
      folder: `yearly-documents/${session.user.id}/${documentYear}/${documentSlot}`,
    });

    const savedDocument = existingDocument
      ? await updateYearlyDocument(existingDocument.id, {
          fileName: uploaded.fileName,
          filePath: uploaded.path,
          storagePath: uploaded.path,
          mimeType: uploaded.mimeType,
        })
      : await createYearlyDocument({
          userId: session.user.id,
          documentYear,
          documentSlot,
          fileName: uploaded.fileName,
          filePath: uploaded.path,
          storagePath: uploaded.path,
          mimeType: uploaded.mimeType,
        });

    if (!savedDocument) {
      return NextResponse.json({ message: "Unable to save document." }, { status: 500 });
    }

    if (existingDocument && existingDocument.storagePath !== uploaded.path) {
      try {
        await deleteSupabaseObjects([existingDocument.storagePath]);
      } catch (cleanupError) {
        console.warn("[uploads/yearly-document] cleanup failed", cleanupError);
      }
    }

    let documentSignedUrl = null;

    try {
      documentSignedUrl = await createSignedSupabaseObjectUrl({
        path: uploaded.path,
        expiresIn: 3600,
      });
    } catch (error) {
      console.warn("[uploads/yearly-document] signed URL generation failed", error);
    }

    return NextResponse.json({
      id: savedDocument.id,
      documentYear: savedDocument.documentYear,
      documentSlot: savedDocument.documentSlot,
      documentLabel: getYearlyDocumentLabel(savedDocument.documentSlot),
      documentDescription: getYearlyDocumentDescription(savedDocument.documentSlot),
      fileName: savedDocument.fileName,
      documentPath: savedDocument.filePath,
      documentSignedUrl,
      storagePath: savedDocument.storagePath,
      mimeType: savedDocument.mimeType,
      createdAt: savedDocument.createdAt,
    });
  } catch (error: unknown) {
    console.error("[uploads/yearly-document] failed", error);

    return NextResponse.json(
      { message: getErrorMessage(error) || "Unable to upload document." },
      { status: 500 }
    );
  }
}
