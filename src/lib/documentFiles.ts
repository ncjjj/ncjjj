const allowedDocumentMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

export function isAllowedDocumentMimeType(mimeType: string): boolean {
  return allowedDocumentMimeTypes.has(String(mimeType || "").trim().toLowerCase());
}

export function getAllowedDocumentMimeTypes(): string[] {
  return Array.from(allowedDocumentMimeTypes);
}
