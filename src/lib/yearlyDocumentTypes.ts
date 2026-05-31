import { isAllowedDocumentMimeType } from "./documentFiles";

export const yearlyDocumentTypes = [
  {
    slot: "bank_statement",
    label: "Bank Statement",
    description: "Bank statement for the selected year",
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
  {
    slot: "last_year_itr",
    label: "Last Year ITR",
    description: "Last Year ITR",
  },
  {
    slot: "last_year_computation",
    label: "Last Year Computation",
    description: "Last Year Computation",
  },
  {
    slot: "last_year_bs",
    label: "Last Year B/S",
    description: "Last Year B/S",
  },
  {
    slot: "last_year_pl",
    label: "Last Year P/L",
    description: "Last Year P/L",
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

export function getFinancialYearStartYear(date = new Date()): number {
  const month = date.getMonth();

  return month >= 5 ? date.getFullYear() : date.getFullYear() - 1;
}

export function formatFinancialYear(startYear: number): string {
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
}

export function getFinancialYearLabel(date = new Date()): string {
  return formatFinancialYear(getFinancialYearStartYear(date));
}

export function getFinancialYearOptions(count = 7, minStartYear = minYearlyDocumentYear): Array<{ value: string; label: string; startYear: number }> {
  const currentStartYear = getFinancialYearStartYear();
  const lowerBound = Math.max(minStartYear, currentStartYear - (count - 1));

  return Array.from({ length: currentStartYear - lowerBound + 1 }, (_, index) => {
    const startYear = currentStartYear - index;

    return {
      startYear,
      value: String(startYear),
      label: formatFinancialYear(startYear),
    };
  });
}

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
  return isAllowedDocumentMimeType(mimeType);
}

export function getYearlyDocumentLabel(slot: YearlyDocumentSlot): string {
  return yearlyDocumentTypes.find((item) => item.slot === slot)?.label || slot;
}

export function getYearlyDocumentDescription(slot: YearlyDocumentSlot): string {
  return yearlyDocumentTypes.find((item) => item.slot === slot)?.description || slot;
}
