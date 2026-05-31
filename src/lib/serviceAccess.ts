export type DashboardServiceKey = "income-tax" | "gst" | "tds";

export type DashboardServiceSection = {
  key: string;
  label: string;
  requiresFinancialYear?: boolean;
};

export type DashboardServiceGroup = {
  key: DashboardServiceKey;
  label: string;
  sections: DashboardServiceSection[];
};

export const DASHBOARD_SERVICE_GROUPS: DashboardServiceGroup[] = [
  {
    key: "income-tax",
    label: "Income Tax",
    sections: [
      { key: "pan-registration", label: "Pan Registration" },
      { key: "income-tax-return-filing", label: "Income Tax Return Filing", requiresFinancialYear: true },
      { key: "financial-statements", label: "Financial Statements" },
    ],
  },
  {
    key: "gst",
    label: "GST",
    sections: [
      { key: "gst-registration", label: "GST Registration" },
      { key: "gstr-1", label: "GSTR-1" },
      { key: "gstr-3b", label: "GSTR-3B" },
      { key: "gstr-9", label: "GSTR-9" },
    ],
  },
  {
    key: "tds",
    label: "TDS",
    sections: [
      { key: "tan-registration", label: "TAN Registration" },
      { key: "tds-return-filing", label: "TDS Return Filing", requiresFinancialYear: true },
    ],
  },
];

export const ADMIN_SERVICE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "income-tax", label: "Income Tax" },
  { value: "gst", label: "GST" },
  { value: "tds", label: "TDS" },
  { value: "ngo-registration", label: "NGO Registration" },
  { value: "consultation-requests", label: "Consultation Requests" },
  { value: "section-8-company-registration", label: "Section 8 Company Registration" },
  { value: "business-registration", label: "Business Registration" },
  { value: "government-registration", label: "Government Registration" },
  { value: "government-licenses", label: "Government Licenses" },
  { value: "fssai-and-eating-licenses", label: "FSSAI and Eating Licenses" },
  { value: "iso-certifications", label: "ISO Certifications" },
  { value: "tax-filing", label: "Tax Filing" },
  { value: "accounting-and-cfo", label: "Accounting and CFO" },
  { value: "contracts-and-agreements", label: "Contracts and Agreements" },
  { value: "legal-assistance", label: "Legal Assistance" },
];

export function encodeServiceAccess(values: string[]): string {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).join(",");
}

export function decodeServiceAccess(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  return Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));
}

export function getDashboardGroupsForAccess(serviceAccess: string[]): DashboardServiceGroup[] {
  const allowed = new Set(serviceAccess);

  return DASHBOARD_SERVICE_GROUPS.filter((group) => allowed.has(group.key));
}
