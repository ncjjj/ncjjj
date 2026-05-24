export type BizServiceItem = {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
};

export type BizServiceCategory = {
  id: string;
  title: string;
  services: BizServiceItem[];
};

export const bizPageContent = {
  badge: "Business Registration & Regulatory Services",
  title: "Complete Business Formation & Legal Structuring Solutions",
  subtitle:
    "At NCJ Legal Business Solutions LLP, we provide comprehensive business registration, incorporation, and regulatory compliance services for startups, entrepreneurs, MSMEs, family businesses, investors, and growing enterprises across India.",
  intro: [
    "Selecting the correct business structure is one of the most important legal and financial decisions for any enterprise. Our experienced team assists clients in choosing the most suitable entity structure based on ownership, taxation, scalability, investment requirements, and regulatory obligations.",
    "From incorporation to post-registration compliance, we deliver end-to-end professional support to ensure smooth and legally compliant business operations.",
  ],
  servicesHeading: "Our Business Registration & Regulatory Services",
  whyChooseHeading: "Why Choose NCJ Legal Business Solutions LLP",
  whyChoosePoints: [
    "60+ Years of Professional Legacy",
    "Experienced Corporate & Tax Professionals",
    "Startup to Enterprise Level Support",
    "Transparent & Timely Process",
    "PAN India Service Network",
    "Complete Regulatory & Compliance Solutions",
  ],
  ctaTitle: "Build Your Business with Legal Strength & Professional Guidance",
  ctaText:
    "Whether you are launching a startup, expanding operations, formalizing an existing business, or entering the Indian market, NCJ Legal Business Solutions LLP delivers reliable, professional, and legally compliant business registration solutions tailored to your objectives.",
  ctaButton: "Contact Us Today",
};

export const bizServiceCategories: BizServiceCategory[] = [
  {
    id: "company",
    title: "Company & Corporate Registrations",
    services: [
      {
        id: "company-registration",
        title: "Company Registration",
        summary:
          "We provide complete assistance for incorporation of private companies in India under the Companies Act, 2013.",
        assistanceLabel: "Our Services Include",
        assistance: [
          "Business structure consultation",
          "Name approval assistance",
          "DSC & DIN processing",
          "MOA & AOA drafting",
          "ROC filing and incorporation",
          "PAN, TAN & compliance guidance",
        ],
        benefits: [
          "Separate legal entity",
          "Limited liability protection",
          "Improved business credibility",
          "Better funding and investment opportunities",
          "Structured governance framework",
        ],
      },
      {
        id: "llp-registration",
        title: "LLP Registration",
        summary:
          "Limited Liability Partnership (LLP) is an ideal structure for professionals, consultants, and growing businesses seeking operational flexibility with limited liability protection.",
        assistanceLabel: "Our Assistance",
        assistance: ["LLP incorporation", "Partner documentation", "LLP agreement drafting", "PAN & TAN assistance", "Compliance advisory"],
        benefits: ["Limited liability protection", "Lower compliance burden", "Flexible management structure", "Separate legal identity"],
      },
      {
        id: "public-limited",
        title: "Public Limited Company Registration",
        summary:
          "A Public Limited Company is suitable for large businesses intending to raise capital from the public or institutional investors.",
        assistanceLabel: "Our Services",
        assistance: ["Incorporation advisory", "ROC filing support", "MOA & AOA drafting", "Director compliance assistance", "Corporate governance setup"],
        benefits: ["Ability to raise public capital", "Enhanced corporate image", "Greater expansion opportunities", "Investor confidence"],
      },
      {
        id: "opc",
        title: "One Person Company Registration",
        summary:
          "One Person Company (OPC) is designed for solo entrepreneurs seeking corporate status with limited liability protection.",
        assistanceLabel: "Our Assistance",
        assistance: ["OPC incorporation", "Name approval", "Documentation support", "ROC filing", "Compliance guidance"],
        benefits: ["Limited liability protection", "Separate legal identity", "Full business control to single owner", "Better credibility than proprietorship"],
      },
    ],
  },

  {
    id: "partnerships",
    title: "Partnership & Proprietorship",
    services: [
      {
        id: "partnership-firm",
        title: "Partnership Firm Registration",
        summary:
          "Partnership firms are suitable for family businesses, traders, and small enterprises operating through mutual agreements among partners.",
        assistanceLabel: "Our Services",
        assistance: ["Partnership deed drafting", "Registration assistance", "PAN & GST guidance", "Compliance advisory", "Amendment support"],
        benefits: ["Easy formation process", "Flexible operations", "Shared responsibilities", "Lower setup cost"],
      },
      {
        id: "sole-proprietorship",
        title: "Sole Proprietorship Registration",
        summary:
          "A Sole Proprietorship is the simplest form of business structure for individual entrepreneurs and small businesses.",
        assistanceLabel: "Our Assistance",
        assistance: ["Proprietorship setup advisory", "GST registration", "MSME/Udyam registration", "Shop & Establishment guidance", "Business compliance assistance"],
        benefits: ["Minimal compliance requirements", "Complete ownership control", "Easy business operations", "Cost-effective setup"],
      },
    ],
  },

  {
    id: "specialized",
    title: "Specialized Company Types & Subsidiaries",
    services: [
      {
        id: "nidhi",
        title: "Nidhi Company Registration",
        summary:
          "Nidhi Companies are specialized entities formed for cultivating savings and providing financial support among members.",
        assistanceLabel: "Our Services",
        assistance: ["Incorporation support", "MCA compliance assistance", "Documentation drafting", "Regulatory advisory", "Annual compliance management"],
        benefits: ["Member-based financial operations", "Structured financial governance", "Separate legal entity", "Regulatory recognition"],
      },
      {
        id: "producer-company",
        title: "Producer Company Registration",
        summary:
          "Producer Companies are formed for farmers, agricultural producers, and rural entrepreneurs to collectively manage production, procurement, and marketing activities.",
        assistanceLabel: "Our Assistance",
        assistance: ["Incorporation advisory", "Producer documentation support", "MOA & AOA drafting", "Regulatory compliance assistance", "Government scheme advisory"],
        benefits: ["Collective business growth for producers", "Better market access", "Financial and operational support", "Separate legal structure for agricultural businesses"],
      },
      {
        id: "indian-subsidiary",
        title: "Indian Subsidiary Company Registration",
        summary:
          "We assist foreign entities and overseas investors in establishing subsidiary companies in India in compliance with Indian corporate and foreign investment regulations.",
        assistanceLabel: "Our Services",
        assistance: ["Entry structure advisory", "Incorporation support", "FEMA & RBI compliance guidance", "Director and shareholder documentation", "Regulatory approvals assistance"],
        benefits: ["Legal business presence in India", "Access to Indian markets", "Limited liability structure", "Compliance with Indian regulations"],
      },
    ],
  },

  {
    id: "post-registration",
    title: "End-to-End Compliance Support",
    services: [
      {
        id: "roc-compliance",
        title: "ROC Compliance",
        summary: "Registrar of Companies compliance including filings, annual returns and statutory obligations.",
        assistanceLabel: "Our Assistance",
        assistance: ["Annual filings", "Statutory records", "Director & shareholder filings", "Compliance advisory"],
        benefits: ["Regulatory compliance", "Avoidance of penalties", "Corporate governance support"],
      },
      {
        id: "tax-gst",
        title: "Income Tax & GST Advisory",
        summary: "Comprehensive tax registration and advisory including GST and income tax compliance.",
        assistanceLabel: "Our Assistance",
        assistance: ["GST registration", "Income tax planning", "Filing support", "Tax litigation support"],
        benefits: ["Tax compliance", "Optimized tax planning", "Reduced regulatory risk"],
      },
      {
        id: "accounting",
        title: "Accounting & Bookkeeping",
        summary: "Bookkeeping, financial statement preparation and audit coordination for growing businesses.",
        assistanceLabel: "Our Assistance",
        assistance: ["Bookkeeping", "Financial statements", "Audit coordination", "Compliance reporting"],
        benefits: ["Financial transparency", "Audit readiness", "Better financial governance"],
      },
    ],
  },
];
