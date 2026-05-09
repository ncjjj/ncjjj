import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../index";
import { documents } from "../schema";

interface CreateDocumentInput {
  userId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  storagePath: string;
  mimeType?: string | null;
}

export async function createDocument({
  userId,
  documentType,
  fileName,
  filePath,
  storagePath,
  mimeType,
}: CreateDocumentInput) {
  const db = getDb();

  const [created] = await db
    .insert(documents)
    .values({
      userId,
      documentType,
      fileName,
      fileUrl: filePath,
      storagePath,
      mimeType,
    })
    .returning({
      id: documents.id,
      userId: documents.userId,
      documentType: documents.documentType,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    });

  return created;
}

export async function listDocumentsForUser(userId: string) {
  const db = getDb();

  return db
    .select({
      id: documents.id,
      documentType: documents.documentType,
      fileName: documents.fileName,
      filePath: documents.fileUrl,
      storagePath: documents.storagePath,
      mimeType: documents.mimeType,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.createdAt));
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
