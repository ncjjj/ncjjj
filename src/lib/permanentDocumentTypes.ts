export const permanentDocumentTypes = [
  {
    type: "aadhar",
    label: "Aadhaar Card",
    description: "Aadhaar card used across services",
  },
  {
    type: "pan",
    label: "PAN Card",
    description: "PAN card used across services",
  },
] as const;

export type PermanentDocumentType = (typeof permanentDocumentTypes)[number]["type"];

export const requiredPermanentDocumentTypes = ["aadhar", "pan"] as const;
export type RequiredPermanentDocumentType = (typeof requiredPermanentDocumentTypes)[number];

export const permanentDocumentTypeSet = new Set<PermanentDocumentType>(
  permanentDocumentTypes.map((item) => item.type)
);

export const maxPermanentDocumentSizeBytes = 50 * 1024 * 1024;

export function isAllowedPermanentDocumentMimeType(mimeType: string): boolean {
  return Boolean(mimeType || "application/octet-stream");
}

export function getPermanentDocumentLabel(type: PermanentDocumentType): string {
  return permanentDocumentTypes.find((item) => item.type === type)?.label || type;
}

export function getPermanentDocumentDescription(type: PermanentDocumentType): string {
  return permanentDocumentTypes.find((item) => item.type === type)?.description || type;
}
