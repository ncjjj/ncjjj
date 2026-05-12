import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../index";
import { documents, users } from "../schema";
import type { AdminDocumentUserGroup } from "../../types/domain";
import { createSignedSupabaseObjectUrls } from "../../lib/supabaseStorage";
import { permanentDocumentTypeSet } from "../../lib/permanentDocumentTypes";
import { yearlyDocumentSlotSet } from "../../lib/yearlyDocumentTypes";

type AdminDocumentRow = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  documentType: string;
  documentYear: number | null;
  documentSlot: string | null;
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
  accountNumber: string | null;
  gstNumber: string | null;
  uploadDescription: string | null;
  createdAt: Date;
};

function getDocumentCategory(row: AdminDocumentRow): "general" | "yearly" | "permanent" {
  if (
    row.documentYear !== null &&
    row.documentSlot !== null &&
    yearlyDocumentSlotSet.has(row.documentSlot as any)
  ) {
    return "yearly";
  }

  if (permanentDocumentTypeSet.has(row.documentType as any)) {
    return "permanent";
  }

  return "general";
}

export async function listDocumentsForAdmin(): Promise<AdminDocumentUserGroup[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: documents.id,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      userPhone: users.mobileNumber,
      documentType: documents.documentType,
      documentYear: documents.documentYear,
      documentSlot: documents.documentSlot,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      aadharNumber: documents.aadharNumber,
      panNumber: documents.panNumber,
      accountNumber: documents.accountNumber,
      gstNumber: documents.gstNumber,
      uploadDescription: documents.uploadDescription,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .innerJoin(users, eq(documents.userId, users.id))
    .orderBy(asc(users.name), desc(documents.createdAt));

  const signedMap = await createSignedSupabaseObjectUrls(
    rows.map((row) => row.filePath || row.storagePath),
    3600
  );

  const grouped = new Map<string, AdminDocumentUserGroup>();

  for (const row of rows as AdminDocumentRow[]) {
    const normalizedPath = String(row.filePath || row.storagePath || "").replace(/^\/+/, "");

    if (!grouped.has(row.userId)) {
      grouped.set(row.userId, {
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        userPhone: row.userPhone,
        documents: [],
      });
    }

    grouped.get(row.userId)?.documents.push({
      id: row.id,
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      userPhone: row.userPhone,
      documentType: row.documentType,
      documentCategory: getDocumentCategory(row),
      documentYear: row.documentYear,
      documentSlot: row.documentSlot,
      fileName: row.fileName,
      filePath: normalizedPath,
      signedUrl: signedMap[normalizedPath] || null,
      mimeType: row.mimeType,
      aadharNumber: row.aadharNumber,
      panNumber: row.panNumber,
      accountNumber: row.accountNumber,
      gstNumber: row.gstNumber,
      uploadDescription: row.uploadDescription,
      createdAt: row.createdAt.toISOString(),
    });
  }

  return Array.from(grouped.values());
}
