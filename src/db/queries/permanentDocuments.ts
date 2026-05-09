import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../index";
import { documents } from "../schema";
import {
  getPermanentDocumentLabel,
  permanentDocumentTypeSet,
  type PermanentDocumentType,
} from "../../lib/permanentDocumentTypes";

export interface PermanentDocumentRecord {
  id: string;
  documentType: PermanentDocumentType;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType: string | null;
  createdAt: Date;
}

type PermanentDocumentRow = {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType: string | null;
  createdAt: Date;
};

function normalizePermanentDocumentRow(row: PermanentDocumentRow): PermanentDocumentRecord | null {
  if (!permanentDocumentTypeSet.has(row.documentType as PermanentDocumentType)) {
    return null;
  }

  return {
    id: row.id,
    documentType: row.documentType as PermanentDocumentType,
    fileName: row.fileName,
    fileUrl: row.fileUrl,
    storagePath: row.storagePath,
    mimeType: row.mimeType,
    createdAt: row.createdAt,
  };
}

interface CreatePermanentDocumentInput {
  userId: string;
  documentType: PermanentDocumentType;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType?: string | null;
}

interface UpdatePermanentDocumentInput {
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType?: string | null;
}

export async function listPermanentDocumentsForUser(
  userId: string
): Promise<PermanentDocumentRecord[]> {
  const db = getDb();

  const rows = await db
    .select({
      id: documents.id,
      documentType: documents.documentType,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        isNull(documents.documentYear),
        isNull(documents.documentSlot)
      )
    );

  return rows
    .map((row) => normalizePermanentDocumentRow(row as PermanentDocumentRow))
    .filter((row): row is PermanentDocumentRecord => row !== null);
}

export async function getPermanentDocumentForUser(
  userId: string,
  documentType: PermanentDocumentType
): Promise<PermanentDocumentRecord | undefined> {
  const db = getDb();

  const [document] = await db
    .select({
      id: documents.id,
      documentType: documents.documentType,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        eq(documents.documentType, documentType),
        isNull(documents.documentYear),
        isNull(documents.documentSlot)
      )
    );

  if (!document) {
    return undefined;
  }

  const result = normalizePermanentDocumentRow(document as PermanentDocumentRow);
  return result || undefined;
}

export async function createPermanentDocument(
  input: CreatePermanentDocumentInput
): Promise<PermanentDocumentRecord> {
  const db = getDb();

  const [document] = await db
    .insert(documents)
    .values({
      userId: input.userId,
      documentType: input.documentType,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      storagePath: input.storagePath,
      mimeType: input.mimeType || null,
      documentYear: null,
      documentSlot: null,
    })
    .returning({
      id: documents.id,
      documentType: documents.documentType,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    });

  if (!document) {
    throw new Error("Failed to create permanent document");
  }

  const result = normalizePermanentDocumentRow(document as PermanentDocumentRow);
  if (!result) {
    throw new Error("Invalid permanent document type");
  }

  return result;
}

export async function updatePermanentDocument(
  id: string,
  input: UpdatePermanentDocumentInput
): Promise<PermanentDocumentRecord> {
  const db = getDb();

  const [document] = await db
    .update(documents)
    .set({
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      storagePath: input.storagePath,
      mimeType: input.mimeType || null,
    })
    .where(eq(documents.id, id))
    .returning({
      id: documents.id,
      documentType: documents.documentType,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    });

  if (!document) {
    throw new Error("Failed to update permanent document");
  }

  const result = normalizePermanentDocumentRow(document as PermanentDocumentRow);
  if (!result) {
    throw new Error("Invalid permanent document type");
  }

  return result;
}

export async function deletePermanentDocument(id: string): Promise<void> {
  const db = getDb();

  await db.delete(documents).where(eq(documents.id, id));
}
