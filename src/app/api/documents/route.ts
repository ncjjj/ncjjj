import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authOptions } from "../../../lib/auth";
import {
  deleteDocumentByIdForUser,
  listDocumentsForUser,
} from "../../../db/queries/documents";
import { createSignedSupabaseObjectUrls } from "../../../lib/supabaseStorage";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await listDocumentsForUser(session.user.id);
    const signedMap = await createSignedSupabaseObjectUrls(
      documents.map((item) => item.filePath || item.storagePath),
      3600
    );

    return NextResponse.json({
      documents: documents.map((item) => {
        const normalizedPath = String(item.filePath || item.storagePath || "").replace(/^\/+/, "");
        return {
          ...item,
          filePath: normalizedPath,
          signedUrl: signedMap[normalizedPath] || null,
        };
      }),
    });
  } catch (error) {
    console.error("[api/documents] GET failed", error);
    return NextResponse.json({ message: "Unable to load documents." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const documentId = body?.documentId;

    if (!documentId) {
      return NextResponse.json({ message: "Document ID is required." }, { status: 400 });
    }

    const deleted = await deleteDocumentByIdForUser(documentId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[api/documents] DELETE failed", error);
    return NextResponse.json({ message: "Unable to delete document." }, { status: 500 });
  }
}