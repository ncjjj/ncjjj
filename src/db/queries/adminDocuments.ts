import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../index";
import { documents, users } from "../schema";
import type { AdminDocumentUserGroup } from "../../types/domain";
import { createSignedSupabaseObjectUrls, listSupabaseObjects } from "../../lib/supabaseStorage";
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
  createdAt: Date;
};

type BucketDocumentEntry = Omit<AdminDocumentRow, "id" | "userName" | "userEmail" | "userPhone" | "createdAt"> & {
  createdAt: Date | null;
  path: string;
};

function getDocumentCategory(row: AdminDocumentRow): "general" | "yearly" | "permanent" {
  if (row.documentYear !== null && row.documentSlot !== null && yearlyDocumentSlotSet.has(row.documentSlot as any)) {
    return "yearly";
  }

  if (permanentDocumentTypeSet.has(row.documentType as any)) {
    return "permanent";
  }

  return "general";
}

export async function listDocumentsForAdmin(): Promise<AdminDocumentUserGroup[]> {
  const db = getDb();

  // Attempt to build the document list from bucket objects (preferred production path).
  try {
    const yearly = await listSupabaseObjects("yearly-documents", { limit: 2000 });
    const permanent = await listSupabaseObjects("permanent-documents", { limit: 2000 });

    const all = [...yearly, ...permanent];

    if (all.length > 0) {
      // Collect user ids from object paths: expected formats:
      // yearly-documents/{userId}/{year}/{slot}/{filename}
      // permanent-documents/{userId}/{type}/{filename}
      const userIds = new Set<string>();
      const entries: BucketDocumentEntry[] = [];

      for (const obj of all) {
        const path = String(obj.path || obj.name || "").replace(/^\/+/, "");
        const parts = path.split("/");
        if (parts.length < 3) continue;

        const prefix = parts[0];
        const userId = parts[1];
        if (!userId) continue;
        userIds.add(userId);

        if (prefix === "yearly-documents" && parts.length >= 4) {
          const yearPart = parts[2];
          const slot = parts[3];
          if (!yearPart || !slot) continue;

          const parsedYear = Number.parseInt(yearPart, 10);
          const year = Number.isNaN(parsedYear) ? null : parsedYear;
          entries.push({
            userId,
            documentType: slot,
            documentYear: year,
            documentSlot: slot,
            fileName: obj.name,
            filePath: path,
            storagePath: path,
            mimeType: obj.metadata?.contentType || null,
            createdAt: obj.createdAt ? new Date(obj.createdAt) : null,
            path,
          });
        } else if (prefix === "permanent-documents" && parts.length >= 3) {
          const type = parts[2];
          if (!type) continue;

          entries.push({
            userId,
            documentType: type,
            documentYear: null,
            documentSlot: null,
            fileName: obj.name,
            filePath: path,
            storagePath: path,
            mimeType: obj.metadata?.contentType || null,
            createdAt: obj.createdAt ? new Date(obj.createdAt) : null,
            path,
          });
        }
      }

      // Fetch user details for these userIds
      const usersRows = await db
        .select({ id: users.id, name: users.name, email: users.email, mobileNumber: users.mobileNumber })
        .from(users)
        .where(inArray(users.id, Array.from(userIds)));

      const userMap = new Map(usersRows.map((u: any) => [String(u.id), u]));

      const signedMap = await createSignedSupabaseObjectUrls(entries.map((e) => e.filePath || e.storagePath), 3600);

      const grouped = new Map<string, AdminDocumentUserGroup>();

      for (const ent of entries) {
        if (!ent.userId) continue;
        const user = userMap.get(ent.userId) || { id: ent.userId, name: "(unknown)", email: "", mobileNumber: "" };

        if (!grouped.has(ent.userId)) {
          grouped.set(ent.userId, {
            userId: ent.userId,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.mobileNumber,
            documents: [],
          });
        }

        grouped.get(ent.userId)?.documents.push({
          id: "", // bucket-only entries don't have DB id
          userId: ent.userId,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.mobileNumber,
          documentType: ent.documentType || "",
          documentCategory: ent.documentYear !== null && ent.documentSlot ? "yearly" : permanentDocumentTypeSet.has(ent.documentType as any) ? "permanent" : "general",
          documentYear: ent.documentYear || null,
          documentSlot: ent.documentSlot || null,
          fileName: ent.fileName || "",
          filePath: String(ent.filePath || ent.storagePath || "").replace(/^\/+/, ""),
          signedUrl: signedMap[String(ent.filePath || ent.storagePath || "")] || null,
          mimeType: ent.mimeType || null,
          createdAt: ent.createdAt ? ent.createdAt.toISOString() : new Date().toISOString(),
        });
      }

      return Array.from(grouped.values());
    }
  } catch (error) {
    // If storage listing fails, fall back to DB-based listing below.
    console.warn("[adminDocuments] bucket listing failed, falling back to DB", error);
  }

  // Fallback: use DB-backed listing (existing behaviour)
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
      createdAt: row.createdAt.toISOString(),
    });
  }

  return Array.from(grouped.values());
}
