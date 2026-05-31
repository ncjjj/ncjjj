import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { listYearlyDocumentsForUser } from "../../../db/queries/yearlyDocuments";
import { resolveSupabaseObjectUrl } from "../../../lib/supabaseStorage";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const yearlyDocuments = await listYearlyDocumentsForUser(session.user.id);

    const documents = await Promise.all(
      yearlyDocuments.map(async (item) => {
        const resolved = await resolveSupabaseObjectUrl({
          path: item.storagePath,
          expiresIn: 3600,
        });

        return {
          id: item.id,
          documentYear: item.documentYear,
          documentSlot: item.documentSlot,
          fileName: item.fileName,
          filePath: item.filePath,
          storagePath: item.storagePath,
          signedUrl: resolved.avatarUrl,
          mimeType: item.mimeType,
          createdAt: item.createdAt,
        };
      })
    );

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("[api/yearly-documents] GET failed", error);
    return NextResponse.json(
      { message: "Unable to load yearly documents." },
      { status: 500 }
    );
  }
}
