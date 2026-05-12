export const SERVICE_CATALOG = {
  "gst-consultation": {
    id: "gst-consultation",
    name: "GST Consultation",
    description: "GST registration, filing and compliance support",
  },
  "itr-filing": {
    id: "itr-filing",
    name: "ITR Filing",
    description: "Income tax return filing and review",
  },
  "accounting-support": {
    id: "accounting-support",
    name: "Accounting Support",
    description: "Bookkeeping, reports and tax planning",
  },
  "business-setup": {
    id: "business-setup",
    name: "Business Setup",
    description: "Entity registration and launch compliance",
  },
  "legal-assistance": {
    id: "legal-assistance",
    name: "Legal Assistance",
    description: "Legal notices, agreements and advisory",
  },
} as const;

export type ServiceCatalogKey = keyof typeof SERVICE_CATALOG;
export type ServiceMeta = (typeof SERVICE_CATALOG)[ServiceCatalogKey];

function isServiceCatalogKey(value: string): value is ServiceCatalogKey {
  return value in SERVICE_CATALOG;
}

export function getServiceMeta(serviceId: string): {
  id: string;
  name: string;
  description: string;
} {
  if (isServiceCatalogKey(serviceId)) {
    return SERVICE_CATALOG[serviceId];
  }

  // For unknown service IDs, return a descriptive name based on the serviceId
  const formattedName = serviceId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: serviceId,
    name: formattedName,
    description: "Submit documents for verification",
  };
}
