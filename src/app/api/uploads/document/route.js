import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { createDocument } from "../../../../db/queries/documents";
import {
  createSignedSupabaseObjectUrl,
  uploadFileToSupabase,
} from "../../../../lib/supabaseStorage";

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

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = formData.get("documentType");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ message: "Document file is required." }, { status: 400 });
    }

    if (!allowedDocumentTypes.includes(documentType)) {
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

    let documentSignedUrl = null;

    try {
      documentSignedUrl = await createSignedSupabaseObjectUrl({
        path: uploaded.path,
        expiresIn: 3600,
      });
    } catch (error) {
      console.warn("[uploads/document] signed URL generation failed", error);
    }

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
  } catch (error) {
    console.error("[uploads/document] failed", error);

    return NextResponse.json(
      { message: error?.message || "Unable to upload document." },
      { status: 500 }
    );
  }
}
