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
};

export function getServiceMeta(serviceId) {
  return (
    SERVICE_CATALOG[serviceId] || {
      id: serviceId,
      name: "Service Request",
      description: "Submit documents for verification",
    }
  );
}
