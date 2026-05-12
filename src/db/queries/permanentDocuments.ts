import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../index";
import { documents } from "../schema";
import {
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
  aadharNumber: string | null;
  panNumber: string | null;
  accountNumber: string | null;
  gstNumber: string | null;
  uploadDescription: string | null;
  createdAt: Date;
}

export interface PermanentDocumentNumbers {
  aadharNumber: string;
  panNumber: string;
  accountNumber: string;
  gstNumber: string;
}

export interface CreatePermanentDocumentInput {
  userId: string;
  documentType: PermanentDocumentType;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType?: string | null;
  aadharNumber?: string | null;
  panNumber?: string | null;
  accountNumber?: string | null;
  gstNumber?: string | null;
  uploadDescription?: string | null;
}

export interface UpdatePermanentDocumentInput {
  fileName?: string;
  fileUrl?: string;
  storagePath?: string;
  mimeType?: string | null;
  aadharNumber?: string | null;
  panNumber?: string | null;
  accountNumber?: string | null;
  gstNumber?: string | null;
  uploadDescription?: string | null;
}

type PermanentDocumentRow = {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  mimeType: string | null;
  aadharNumber: string | null;
  panNumber: string | null;
  accountNumber: string | null;
  gstNumber: string | null;
  uploadDescription: string | null;
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
    aadharNumber: row.aadharNumber,
    panNumber: row.panNumber,
    accountNumber: row.accountNumber,
    gstNumber: row.gstNumber,
    uploadDescription: row.uploadDescription,
    createdAt: row.createdAt,
  };
}

function firstNonEmptyValue(values: Array<string | null | undefined>): string {
  return values.find((value) => Boolean(value?.trim()))?.trim() || "";
}

export function getPermanentDocumentNumbers(
  permanentDocuments: PermanentDocumentRecord[]
): PermanentDocumentNumbers {
  const byType = new Map(permanentDocuments.map((item) => [item.documentType, item]));

  return {
    aadharNumber: firstNonEmptyValue([
      byType.get("aadhar")?.aadharNumber,
      ...permanentDocuments.map((item) => item.aadharNumber),
    ]),
    panNumber: firstNonEmptyValue([
      byType.get("pan")?.panNumber,
      ...permanentDocuments.map((item) => item.panNumber),
    ]),
    accountNumber: firstNonEmptyValue(permanentDocuments.map((item) => item.accountNumber)),
    gstNumber: firstNonEmptyValue(permanentDocuments.map((item) => item.gstNumber)),
  };
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
      aadharNumber: documents.aadharNumber,
      panNumber: documents.panNumber,
      accountNumber: documents.accountNumber,
      gstNumber: documents.gstNumber,
      uploadDescription: documents.uploadDescription,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(
      and(
        eq(documents.userId, userId),
        isNull(documents.documentYear),
        isNull(documents.documentSlot)
      )
    )
    .orderBy(desc(documents.createdAt));

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
      aadharNumber: documents.aadharNumber,
      panNumber: documents.panNumber,
      accountNumber: documents.accountNumber,
      gstNumber: documents.gstNumber,
      uploadDescription: documents.uploadDescription,
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
    )
    .limit(1);

  return document
    ? normalizePermanentDocumentRow(document as PermanentDocumentRow) || undefined
    : undefined;
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
      mimeType: input.mimeType ?? null,
      aadharNumber: input.aadharNumber?.trim() || null,
      panNumber: input.panNumber?.trim() || null,
      accountNumber: input.accountNumber?.trim() || null,
      gstNumber: input.gstNumber?.trim() || null,
      uploadDescription: input.uploadDescription?.trim() || null,
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
      aadharNumber: documents.aadharNumber,
      panNumber: documents.panNumber,
      accountNumber: documents.accountNumber,
      gstNumber: documents.gstNumber,
      uploadDescription: documents.uploadDescription,
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
      ...(input.fileName !== undefined && { fileName: input.fileName }),
      ...(input.fileUrl !== undefined && { fileUrl: input.fileUrl }),
      ...(input.storagePath !== undefined && { storagePath: input.storagePath }),
      ...(input.mimeType !== undefined && { mimeType: input.mimeType ?? null }),
      ...(input.aadharNumber !== undefined && {
        aadharNumber: input.aadharNumber?.trim() || null,
      }),
      ...(input.panNumber !== undefined && {
        panNumber: input.panNumber?.trim() || null,
      }),
      ...(input.accountNumber !== undefined && {
        accountNumber: input.accountNumber?.trim() || null,
      }),
      ...(input.gstNumber !== undefined && {
        gstNumber: input.gstNumber?.trim() || null,
      }),
      ...(input.uploadDescription !== undefined && {
        uploadDescription: input.uploadDescription?.trim() || null,
      }),
    })
    .where(eq(documents.id, id))
    .returning({
      id: documents.id,
      documentType: documents.documentType,
      fileName: documents.fileName,
      fileUrl: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      aadharNumber: documents.aadharNumber,
      panNumber: documents.panNumber,
      accountNumber: documents.accountNumber,
      gstNumber: documents.gstNumber,
      uploadDescription: documents.uploadDescription,
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
