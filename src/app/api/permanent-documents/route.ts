import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../../../lib/auth";
import {
  getPermanentDocumentForUser,
  getPermanentDocumentNumbers,
  listPermanentDocumentsForUser,
  updatePermanentDocument,
} from "../../../db/queries/permanentDocuments";
import { permanentDocumentTypeSet } from "../../../lib/permanentDocumentTypes";
import { resolveSupabaseObjectUrl } from "../../../lib/supabaseStorage";

const updateDetailsSchema = z.object({
  documentType: z.string().trim(),
  aadharNumber: z.string().trim().optional().nullable(),
  panNumber: z.string().trim().optional().nullable(),
  accountNumber: z.string().trim().optional().nullable(),
  gstNumber: z.string().trim().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const records = await listPermanentDocumentsForUser(session.user.id);

    const documents = await Promise.all(
      records.map(async (item) => {
        const resolved = await resolveSupabaseObjectUrl({
          path: item.storagePath,
          expiresIn: 3600,
        });

        return {
          ...item,
          signedUrl: resolved.avatarUrl,
          documentSignedUrl: resolved.avatarUrl,
        };
      })
    );

    return NextResponse.json({
      documents,
      numbers: getPermanentDocumentNumbers(records),
    });
  } catch (error) {
    console.error("[api/permanent-documents] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load permanent documents." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const parsed = updateDetailsSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    const documentType = parsed.data.documentType as any;

    if (!permanentDocumentTypeSet.has(documentType)) {
      return NextResponse.json({ message: "Invalid document type." }, { status: 400 });
    }

    const document = await getPermanentDocumentForUser(session.user.id, documentType);

    if (!document) {
      return NextResponse.json({ message: "Document not found." }, { status: 404 });
    }

    const updated = await updatePermanentDocument(document.id, {
      aadharNumber: parsed.data.aadharNumber || null,
      panNumber: parsed.data.panNumber || null,
      accountNumber: parsed.data.accountNumber || null,
      gstNumber: parsed.data.gstNumber || null,
    });

    return NextResponse.json({ document: updated, message: "Details updated successfully." });
  } catch (error) {
    console.error("[api/permanent-documents] PATCH failed", error);
    return NextResponse.json(
      { message: "Unable to update permanent document details." },
      { status: 500 }
    );
  }
}
