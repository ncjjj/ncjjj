export const permanentDocumentTypes = [
  {
    type: "aadhar",
    label: "Aadhar Card",
    description: "Aadhar Card (Permanent)",
  },
  {
    type: "pan",
    label: "PAN Card",
    description: "PAN Card (Permanent)",
  },
  {
    type: "photo",
    label: "Photo",
    description: "Passport Photo (Permanent)",
  },
] as const;

export type PermanentDocumentType = (typeof permanentDocumentTypes)[number]["type"];

export const permanentDocumentTypeSet = new Set<PermanentDocumentType>(
  permanentDocumentTypes.map((item) => item.type)
);

export const maxPermanentDocumentSizeBytes = 10 * 1024 * 1024;

export function isAllowedPermanentDocumentMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf" || mimeType.startsWith("image/");
}

export function getPermanentDocumentLabel(type: PermanentDocumentType): string {
  return permanentDocumentTypes.find((item) => item.type === type)?.label || type;
}

export function getPermanentDocumentDescription(type: PermanentDocumentType): string {
  return permanentDocumentTypes.find((item) => item.type === type)?.description || type;
}
