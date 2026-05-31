import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "../../../../lib/auth";
import { getDb } from "../../../../db/index";
import { documents } from "../../../../db/schema";
import { findUserById } from "../../../../db/queries/users";
import {
  deleteSupabaseObjects,
  resolveSupabaseObjectUrl,
  uploadFileToSupabase,
} from "../../../../lib/supabaseStorage";
import { emitAdminEvent } from "../../../../lib/consultationRequestSocket";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

function safeServiceTypeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9:-]/g, "-").replace(/-+/g, "-");
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let uploadedPath: string | null = null;

  try {
    const user = await findUserById(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const rawTypeKey = String(formData.get("typeKey") || "").trim();
    const documentName = String(formData.get("documentName") || "").trim();
    const financialYear = String(formData.get("financialYear") || "").trim();

    if (!(fileEntry instanceof Blob)) {
      return NextResponse.json({ message: "Document file is required." }, { status: 400 });
    }

    if (!rawTypeKey) {
      return NextResponse.json({ message: "Document type is required." }, { status: 400 });
    }

    const fileName = "name" in fileEntry && typeof fileEntry.name === "string"
      ? fileEntry.name
      : "service-document";
    const fileType = typeof fileEntry.type === "string" ? fileEntry.type : "application/octet-stream";
    const fileSize = typeof fileEntry.size === "number" ? fileEntry.size : 0;

    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ message: "Document size must be 20MB or less." }, { status: 400 });
    }

    const typeKey = safeServiceTypeKey(rawTypeKey);

    const file = new File([fileEntry], fileName, {
      type: fileType,
    });

    const uploaded = await uploadFileToSupabase({
      file,
      folder: `service-documents/${session.user.id}/${typeKey}`,
    });
    uploadedPath = uploaded.path;

    const db = getDb();

    const [created] = await db
      .insert(documents)
      .values({
        userId: session.user.id,
        uploadedByUserId: session.user.id,
        documentType: `service:${typeKey}`,
        documentSlot: financialYear || null,
        fileName,
        fileUrl: uploaded.path,
        storagePath: uploaded.path,
        mimeType: fileType,
        uploadStatus: "uploaded",
        uploadDescription: documentName || fileName,
      })
      .returning({
        id: documents.id,
        fileName: documents.fileName,
        storagePath: documents.storagePath,
        documentType: documents.documentType,
        documentSlot: documents.documentSlot,
        uploadDescription: documents.uploadDescription,
        createdAt: documents.createdAt,
      });

    if (!created) {
      throw new Error("Unable to save document details.");
    }

    const resolved = await resolveSupabaseObjectUrl({
      path: created.storagePath,
      expiresIn: 3600,
    });

    uploadedPath = null;

    emitAdminEvent("document-uploaded", {
      userId: session.user.id,
      email: session.user.email,
      documentType: created.documentType,
      documentSlot: created.documentSlot,
      fileName: created.fileName,
    });

    return NextResponse.json({
      message: "Document uploaded successfully.",
      document: {
        id: created.id,
        fileName: created.fileName,
        documentType: created.documentType,
        financialYear: created.documentSlot,
        documentName: created.uploadDescription,
        viewUrl: resolved.avatarUrl,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    if (uploadedPath) {
      try {
        await deleteSupabaseObjects([uploadedPath]);
      } catch (rollbackError) {
        console.warn("[api/uploads/service-document] rollback failed", rollbackError);
      }
    }

    console.error("[api/uploads/service-document] POST failed", error);
    return NextResponse.json(
      { message: "Unable to upload service document right now." },
      { status: 500 }
    );
  }
}
