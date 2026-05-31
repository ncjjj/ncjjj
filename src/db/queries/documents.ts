import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../index";
import { documents } from "../schema";

interface CreateDocumentInput {
  userId: string;
  uploadedByUserId?: string | null;
  documentType: string;
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType?: string | null;
  uploadStatus?: string;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  uploadedByUserId: string | null;
  documentType: string;
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType: string | null;
  uploadStatus: string;
  createdAt: Date;
}

export async function createDocument({
  userId,
  uploadedByUserId = userId,
  documentType,
  fileName,
  filePath,
  storagePath,
  mimeType,
  uploadStatus = "uploaded",
}: CreateDocumentInput): Promise<DocumentRecord> {
  const db = getDb();

  const [created] = await db
    .insert(documents)
    .values({
      userId,
      uploadedByUserId,
      documentType,
      fileName,
      fileUrl: filePath,
      storagePath,
      mimeType,
      uploadStatus,
    })
    .returning({
      id: documents.id,
      userId: documents.userId,
      uploadedByUserId: documents.uploadedByUserId,
      documentType: documents.documentType,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      uploadStatus: documents.uploadStatus,
      createdAt: documents.createdAt,
    });

  if (!created) {
    throw new Error("Failed to create document.");
  }

  return created;
}

export async function listDocumentsForUser(userId: string) {
  const db = getDb();

  return db
    .select({
      id: documents.id,
      userId: documents.userId,
      uploadedByUserId: documents.uploadedByUserId,
      documentType: documents.documentType,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      uploadStatus: documents.uploadStatus,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
}

export async function findDocumentById(documentId: string): Promise<DocumentRecord | null> {
  const db = getDb();

  const [document] = await db
    .select({
      id: documents.id,
      userId: documents.userId,
      uploadedByUserId: documents.uploadedByUserId,
      documentType: documents.documentType,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      uploadStatus: documents.uploadStatus,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  return document ?? null;
}

export async function deleteDocumentByIdForUser(
  documentId: string,
  userId: string
): Promise<boolean> {
  const db = getDb();

  const deleted = await db
    .delete(documents)
    .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
    .returning({ id: documents.id });

  return deleted.length > 0;
}

export async function updateDocumentStatus(
  documentId: string,
  uploadStatus: string
): Promise<boolean> {
  const db = getDb();

  const updated = await db
    .update(documents)
    .set({ uploadStatus })
    .where(eq(documents.id, documentId))
    .returning({ id: documents.id });

  return updated.length > 0;
}
