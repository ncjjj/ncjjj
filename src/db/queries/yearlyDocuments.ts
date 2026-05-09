import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getDb } from "../index";
import { documents } from "../schema";
import {
  getYearlyDocumentLabel,
  yearlyDocumentSlotSet,
  type YearlyDocumentSlot,
} from "../../lib/yearlyDocumentTypes";

export interface YearlyDocumentRecord {
  id: string;
  documentYear: number;
  documentSlot: YearlyDocumentSlot;
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType: string | null;
  createdAt: Date;
}

type YearlyDocumentRow = {
  id: string;
  documentYear: number | null;
  documentSlot: string | null;
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType: string | null;
  createdAt: Date;
};

function normalizeYearlyDocumentRow(row: YearlyDocumentRow): YearlyDocumentRecord | null {
  if (row.documentYear === null || row.documentSlot === null) {
    return null;
  }

  if (!yearlyDocumentSlotSet.has(row.documentSlot as YearlyDocumentSlot)) {
    return null;
  }

  return {
    id: row.id,
    documentYear: row.documentYear,
    documentSlot: row.documentSlot as YearlyDocumentSlot,
    fileName: row.fileName,
    filePath: row.filePath,
    storagePath: row.storagePath,
    mimeType: row.mimeType,
    createdAt: row.createdAt,
  };
}

interface CreateYearlyDocumentInput {
  userId: string;
  documentYear: number;
  documentSlot: YearlyDocumentSlot;
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType?: string | null;
}

interface UpdateYearlyDocumentInput {
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType?: string | null;
}

export async function listYearlyDocumentsForUser(userId: string): Promise<YearlyDocumentRecord[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: documents.id,
      documentYear: documents.documentYear,
      documentSlot: documents.documentSlot,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        isNotNull(documents.documentYear),
        isNotNull(documents.documentSlot)
      )
    )
    .orderBy(desc(documents.documentYear), desc(documents.createdAt));

  return rows
    .map((row) => normalizeYearlyDocumentRow(row as YearlyDocumentRow))
    .filter((row): row is YearlyDocumentRecord => row !== null);
}

export async function getYearlyDocumentForUser(
  userId: string,
  documentYear: number,
  documentSlot: YearlyDocumentSlot
): Promise<YearlyDocumentRecord | undefined> {
  const db = getDb();

  const [document] = await db
    .select({
      id: documents.id,
      documentYear: documents.documentYear,
      documentSlot: documents.documentSlot,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.documentYear, documentYear),
        eq(documents.documentSlot, documentSlot)
      )
    )
    .limit(1);

  return document ? normalizeYearlyDocumentRow(document as YearlyDocumentRow) || undefined : undefined;
}

export async function createYearlyDocument(input: CreateYearlyDocumentInput): Promise<YearlyDocumentRecord | undefined> {
  const db = getDb();

  const [created] = await db
    .insert(documents)
    .values({
      userId: input.userId,
      documentYear: input.documentYear,
      documentSlot: input.documentSlot,
      documentType: getYearlyDocumentLabel(input.documentSlot),
      fileName: input.fileName,
      fileUrl: input.filePath,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
    })
    .returning({
      id: documents.id,
      documentYear: documents.documentYear,
      documentSlot: documents.documentSlot,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    });

  return created ? normalizeYearlyDocumentRow(created as YearlyDocumentRow) || undefined : undefined;
}

export async function updateYearlyDocument(
  documentId: string,
  input: UpdateYearlyDocumentInput
): Promise<YearlyDocumentRecord | undefined> {
  const db = getDb();

  const [updated] = await db
    .update(documents)
    .set({
      fileName: input.fileName,
      fileUrl: input.filePath,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
    })
    .where(eq(documents.id, documentId))
    .returning({
      id: documents.id,
      documentYear: documents.documentYear,
      documentSlot: documents.documentSlot,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    });

  return updated ? normalizeYearlyDocumentRow(updated as YearlyDocumentRow) || undefined : undefined;
}
