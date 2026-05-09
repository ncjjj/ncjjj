import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { listYearlyDocumentsForUser } from "../../../db/queries/yearlyDocuments";
import { createSignedSupabaseObjectUrls } from "../../../lib/supabaseStorage";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const documents = await listYearlyDocumentsForUser(session.user.id);
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
    console.error("[api/yearly-documents] GET failed", error);
    return NextResponse.json({ message: "Unable to load yearly documents." }, { status: 500 });
  }
}
