import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import {
  deleteDocumentByIdForUser,
  findDocumentById,
  listDocumentsForUser,
} from "../../../db/queries/documents";
import { deleteAppwriteObjects, resolveAppwriteObjectUrl } from "../../../lib/appwriteStorage";
import { emitAdminEvent, emitUserEvent } from "../../../lib/consultationRequestSocket";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userDocs = await listDocumentsForUser(session.user.id);

    const resolvedDocs = await Promise.all(
      userDocs.map(async (doc) => {
        let signedUrl: string | null = null;
        if (doc.storagePath) {
          try {
            const resolved = await resolveAppwriteObjectUrl({
              path: doc.storagePath,
              expiresIn: 3600,
            });
            signedUrl = resolved.avatarUrl;
          } catch (urlError) {
            console.warn("[api/documents] failed to resolve url for document", doc.id, urlError);
          }
        }

        return {
          id: doc.id,
          fileName: doc.fileName,
          documentType: doc.documentType,
          uploadStatus: doc.uploadStatus,
          signedUrl,
        };
      })
    );

    return NextResponse.json({ documents: resolvedDocs });
  } catch (error) {
    console.error("[api/documents] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load documents." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => null)) as { documentId?: string } | null;

    if (!body?.documentId) {
      return NextResponse.json({ message: "Document ID is required." }, { status: 400 });
    }

    const doc = await findDocumentById(body.documentId);

    if (!doc || doc.userId !== session.user.id) {
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    if (doc.uploadStatus === "completed") {
      return NextResponse.json({ message: "Completed documents cannot be deleted." }, { status: 423 });
    }

    if (doc.storagePath) {
      await deleteAppwriteObjects([doc.storagePath]);
    }

    const deleted = await deleteDocumentByIdForUser(body.documentId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ message: "Unable to delete document." }, { status: 500 });
    }

    emitAdminEvent("document-deleted", {
      userId: session.user.id,
      email: session.user.email,
      documentId: body.documentId,
    });

    if (session.user.email) {
      emitUserEvent(session.user.email, "document-deleted", {
        documentId: body.documentId,
      });
    }

    return NextResponse.json({ message: "Document deleted successfully." });
  } catch (error) {
    console.error("[api/documents] DELETE failed", error);
    return NextResponse.json(
      { message: "Unable to delete document." },
      { status: 500 }
    );
  }
}
