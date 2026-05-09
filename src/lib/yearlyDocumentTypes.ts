export const yearlyDocumentTypes = [
  {
    slot: "itr",
    label: "ITR",
    description: "Income Tax Return",
  },
  {
    slot: "document_2",
    label: "Document 2",
    description: "Document 2",
  },
  {
    slot: "document_3",
    label: "Document 3",
    description: "Document 3",
  },
] as const;

export type YearlyDocumentSlot = (typeof yearlyDocumentTypes)[number]["slot"];

export const yearlyDocumentSlotOrder = yearlyDocumentTypes.reduce<Record<YearlyDocumentSlot, number>>(
  (accumulator, item, index) => {
    accumulator[item.slot] = index;
    return accumulator;
  },
  {} as Record<YearlyDocumentSlot, number>
);

export const yearlyDocumentSlotSet = new Set<YearlyDocumentSlot>(
  yearlyDocumentTypes.map((item) => item.slot)
);

export const minYearlyDocumentYear = 2020;
export const maxYearlyDocumentSizeBytes = 10 * 1024 * 1024;

export function getYearlyDocumentYears(minYear = minYearlyDocumentYear): number[] {
  const currentYear = new Date().getFullYear();
  const startYear = Math.min(minYear, currentYear);

  return Array.from({ length: currentYear - startYear + 1 }, (_, index) => currentYear - index);
}

export function normalizeYearlyDocumentYear(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);

  if (!Number.isInteger(parsed)) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  if (parsed < minYearlyDocumentYear || parsed > currentYear) {
    return null;
  }

  return parsed;
}

export function isAllowedYearlyDocumentMimeType(mimeType: string): boolean {
  return mimeType === "application/pdf" || mimeType.startsWith("image/");
}

export function getYearlyDocumentLabel(slot: YearlyDocumentSlot): string {
  return yearlyDocumentTypes.find((item) => item.slot === slot)?.label || slot;
}

export function getYearlyDocumentDescription(slot: YearlyDocumentSlot): string {
  return yearlyDocumentTypes.find((item) => item.slot === slot)?.description || slot;
}
