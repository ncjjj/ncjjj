export type GstServiceItem = {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
};

export type GstServiceCategory = {
  id: string;
  title: string;
  services: GstServiceItem[];
};

export const gstPageContent = {
  badge: "Tax Filing & Compliance Services",
  title: "Tax Filing & Compliance Services",
  subtitle:
    "Comprehensive taxation, regulatory compliance and advisory solutions for businesses, startups, professionals, corporates, NRIs, partnerships, LLPs and companies across India.",
  intro: [
    "At NCJ Legal Business Solutions LLP, we provide end-to-end taxation, return filing, advisory and compliance management services for businesses, startups, professionals, corporates, NRIs, partnerships, LLPs and companies across India.",
    "Tax compliance is a critical part of every business and individual financial structure. Proper filing, accurate reporting and timely compliance ensure legal protection while supporting smooth operations, financial transparency and long-term growth.",
    "Our experienced team of tax professionals, accountants and legal advisors provides structured and reliable support for GST compliance, income tax filings, TDS management, notices handling and regulatory advisory services.",
  ],
  servicesHeading: "Our Tax Filing & Compliance Services",
  whyChooseHeading: "Why Choose NCJ Legal Business Solutions LLP",
  whyChoosePoints: [
    "60+ Years of Professional Legacy",
    "Experienced Tax & Legal Professionals",
    "Specialized GST & Direct Tax Advisory",
    "PAN India Compliance Support",
    "Technology-Driven Compliance Solutions",
    "Timely Filing & Regulatory Assistance",
    "Strong Expertise in Tax Litigation & Notices",
  ],
  ctaTitle: "Reliable Tax Compliance Solutions for Businesses & Individuals",
  ctaText:
    "Whether you are a startup, established business, professional, NRI, exporter, corporate entity or growing enterprise, NCJ Legal Business Solutions LLP provides professional taxation and compliance services to ensure accurate filing, legal compliance and long-term financial efficiency.",
  ctaButton: "Connect With Us Today",
};

export const gstServiceCategories: GstServiceCategory[] = [
  {
    id: "gst-compliance",
    title: "GST Compliance Services",
    services: [
      {
        id: "gst-registration",
        title: "GST Registration",
        summary:
          "GST registration is mandatory for businesses crossing prescribed turnover limits or engaged in taxable supply of goods and services.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "GST registration filing",
          "Business eligibility analysis",
          "Documentation support",
          "PAN and Aadhaar verification assistance",
          "GST compliance setup",
        ],
        benefits: [
          "Legal authority to collect GST",
          "Input tax credit eligibility",
          "Enhanced business credibility",
          "Interstate business operations",
          "Compliance with indirect tax laws",
        ],
      },
      {
        id: "gst-return-filing",
        title: "GST Return Filing",
        summary:
          "We provide complete GST return filing services for regular taxpayers, composition dealers, e-commerce operators and service providers.",
        assistanceLabel: "Our Services",
        assistance: [
          "Monthly and quarterly return filing",
          "Sales and purchase reconciliation",
          "Input tax credit review",
          "Error correction and compliance support",
        ],
        benefits: [
          "Timely GST compliance",
          "Avoidance of penalties and interest",
          "Accurate tax reporting",
          "Smooth business operations",
        ],
      },
      {
        id: "gst-annual-return",
        title: "GST Annual Return Filing",
        summary:
          "Annual GST return filing is mandatory for eligible registered taxpayers under GST law.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Annual data reconciliation",
          "GSTR-9 and related filing support",
          "Compliance review",
          "Audit coordination assistance",
        ],
        benefits: [
          "Proper annual GST compliance",
          "Accurate reconciliation of tax records",
          "Reduced litigation risks",
          "Improved compliance management",
        ],
      },
      {
        id: "gst-advisory",
        title: "GST Advisory Services",
        summary:
          "We provide professional GST advisory services for businesses requiring strategic tax planning and compliance management.",
        assistanceLabel: "Our Services",
        assistance: [
          "GST applicability analysis",
          "Tax structuring advisory",
          "Classification and valuation guidance",
          "Input tax credit advisory",
          "Litigation and notice support",
        ],
        benefits: [
          "Better tax efficiency",
          "Reduced compliance risks",
          "Proper tax planning",
          "Stronger regulatory protection",
        ],
      },
      {
        id: "gst-lut-form",
        title: "GST LUT Form",
        summary:
          "Exporters can file LUT under GST to export goods and services without payment of integrated tax.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "LUT filing support",
          "Export compliance advisory",
          "Documentation management",
          "GST export guidance",
        ],
        benefits: [
          "Export without payment of IGST",
          "Improved working capital management",
          "Smooth export compliance",
        ],
      },
      {
        id: "gst-compliance-management",
        title: "GST Compliance Services",
        summary:
          "We provide complete GST compliance management solutions for businesses of all sizes.",
        assistanceLabel: "Our Services",
        assistance: [
          "GST compliance review",
          "Return monitoring",
          "Tax reconciliation",
          "Notice management",
          "Compliance reporting",
        ],
        benefits: [
          "Reduced tax litigation risks",
          "Improved compliance systems",
          "Better financial accuracy",
          "Continuous regulatory support",
        ],
      },
      {
        id: "gst-registration-nri",
        title: "GST Registration for NRI",
        summary:
          "We assist NRIs and foreign businesses in obtaining GST registration for taxable operations in India.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Non-resident GST registration",
          "Compliance structuring",
          "Authorized representative support",
          "Return filing assistance",
        ],
        benefits: [
          "Legal business operations in India",
          "Compliance with Indian GST laws",
          "Smooth taxation management for foreign entities",
        ],
      },
    ],
  },
  {
    id: "income-tax",
    title: "Income Tax Filing & Advisory Services",
    services: [
      {
        id: "income-tax-return-filing",
        title: "Income Tax Return Filing",
        summary:
          "We provide professional income tax return filing services for individuals, businesses, firms, LLPs, companies, trusts and NRIs.",
        assistanceLabel: "Our Services",
        assistance: [
          "Individual and business ITR filing",
          "Capital gains computation",
          "Tax computation and planning",
          "Documentation review",
          "Refund assistance",
        ],
        benefits: [
          "Timely tax compliance",
          "Proper income disclosure",
          "Faster loan and visa processing support",
          "Reduced risk of notices and penalties",
        ],
      },
      {
        id: "income-tax-compliance",
        title: "Income Tax Compliance",
        summary:
          "Our firm provides complete income tax compliance management for businesses and organizations.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Tax audit support",
          "Advance tax advisory",
          "Compliance monitoring",
          "Assessment support",
          "Departmental representation",
        ],
        benefits: [
          "Reduced compliance risks",
          "Better financial governance",
          "Strong legal tax support",
          "Improved operational transparency",
        ],
      },
      {
        id: "income-tax-advisory",
        title: "Income Tax Advisory",
        summary:
          "We provide strategic direct tax advisory services for businesses, corporates, investors and professionals.",
        assistanceLabel: "Our Services",
        assistance: [
          "Tax planning",
          "Business restructuring advisory",
          "Capital gains planning",
          "Litigation support",
          "Compliance structuring",
        ],
        benefits: [
          "Efficient tax planning",
          "Reduced tax exposure",
          "Better financial structuring",
          "Long-term compliance management",
        ],
      },
      {
        id: "itr-for-nri",
        title: "ITR for NRI",
        summary:
          "We assist Non-Resident Indians in filing income tax returns and managing Indian tax compliance requirements.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "NRI income tax filing",
          "Foreign income advisory",
          "Capital gains computation",
          "DTAA advisory",
          "Tax refund assistance",
        ],
        benefits: [
          "Compliance with Indian tax laws",
          "Proper foreign income reporting",
          "Reduced tax disputes",
          "Smooth investment management in India",
        ],
      },
    ],
  },
  {
    id: "tds-professional-tax",
    title: "TDS & Professional Tax Compliance",
    services: [
      {
        id: "tds-return-filing",
        title: "TDS Return Filing",
        summary:
          "TDS compliance is mandatory for businesses deducting tax at source on salaries, contractor payments, professional fees, rent and other specified transactions.",
        assistanceLabel: "Our Services",
        assistance: [
          "Quarterly TDS return filing",
          "TDS reconciliation",
          "Correction statements",
          "Form 16 and Form 16A assistance",
        ],
        benefits: [
          "Timely TDS compliance",
          "Avoidance of penalties and notices",
          "Accurate tax deduction reporting",
          "Improved financial compliance",
        ],
      },
      {
        id: "professional-tax-registration",
        title: "Professional Tax Registration",
        summary:
          "Professional Tax registration is mandatory for eligible employers and professionals in applicable states.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Registration filing",
          "Monthly and annual compliance",
          "Return filing support",
          "Compliance advisory",
        ],
        benefits: [
          "Labour and state tax compliance",
          "Smooth payroll management",
          "Avoidance of state-level penalties",
        ],
      },
    ],
  },
  {
    id: "tax-notices",
    title: "Tax Notice & Compliance Management Software",
    services: [
      {
        id: "income-tax-notice-management",
        title: "Income Tax Notice Management Software",
        summary:
          "We provide professional solutions for management and tracking of income tax notices, assessments and departmental communications.",
        assistanceLabel: "Features",
        assistance: [
          "Notice tracking",
          "Compliance monitoring",
          "Document management",
          "Case status updates",
          "Centralized tax records",
        ],
        benefits: [
          "Faster notice response management",
          "Improved compliance tracking",
          "Reduced litigation risks",
          "Better documentation control",
        ],
      },
      {
        id: "gst-notice-management",
        title: "GST Notice Management Software",
        summary:
          "Our GST notice management solutions help businesses efficiently handle GST notices, assessments and departmental proceedings.",
        assistanceLabel: "Features",
        assistance: [
          "Organized notice handling",
          "Compliance deadline tracking",
          "Reduced response delays",
          "Better litigation preparedness",
        ],
        benefits: [
          "Organized notice handling",
          "Compliance deadline tracking",
          "Reduced response delays",
          "Better litigation preparedness",
        ],
      },
    ],
  },
  {
    id: "corporate-regulatory",
    title: "Corporate Regulatory Compliance",
    services: [
      {
        id: "mca-compliance-insurance-company",
        title: "MCA Compliance for Insurance Company",
        summary:
          "We provide MCA and corporate compliance services specifically designed for insurance companies and regulated financial entities.",
        assistanceLabel: "Our Services",
        assistance: [
          "ROC filing",
          "Annual compliance management",
          "Director compliance",
          "Regulatory reporting",
          "Governance advisory",
        ],
        benefits: [
          "Compliance with Companies Act requirements",
          "Reduced regulatory risks",
          "Smooth corporate governance",
          "Timely statutory reporting",
        ],
      },
    ],
  },
];
