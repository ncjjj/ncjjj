export type AccountingServiceItem = {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
};

export type AccountingServiceCategory = {
  id: string;
  title: string;
  services: AccountingServiceItem[];
};

export const accountingPageContent = {
  badge: "Accounting & CFO Services",
  title: "Accounting & CFO Services",
  subtitle:
    "Strategic financial management, audit and business advisory solutions for startups, MSMEs, corporates, manufacturers, investors and growing enterprises across India.",
  intro: [
    "At NCJ Legal Business Solutions LLP, we provide comprehensive accounting, audit, financial management and virtual CFO services designed to support startups, MSMEs, corporates, manufacturers, investors and growing enterprises across India.",
    "In today’s competitive business environment, organizations require more than traditional bookkeeping. Businesses need accurate financial reporting, strategic decision-making support, operational transparency, compliance management and robust internal financial systems.",
    "Our experienced team of accountants, auditors, tax professionals and business advisors delivers structured financial solutions that help organizations improve operational efficiency, strengthen governance, manage risk and achieve sustainable growth.",
  ],
  servicesHeading: "Our Accounting & CFO Services",
  whyChooseHeading: "Why Choose NCJ Legal Business Solutions LLP",
  whyChoosePoints: [
    "60+ Years of Professional Legacy",
    "Experienced Chartered Accountants & Financial Experts",
    "Industry-Specific Financial Advisory",
    "Technology-Driven Reporting Solutions",
    "End-to-End Accounting & Compliance Support",
    "Strategic CFO-Level Guidance",
    "Transparent & Professional Financial Management",
  ],
  ctaTitle: "Professional Financial Management for Sustainable Business Growth",
  ctaText:
    "Whether you are a startup seeking financial structure, a growing enterprise requiring CFO support or an established organization looking to strengthen accounting systems and operational controls, NCJ Legal Business Solutions LLP delivers reliable, professional and growth-oriented accounting and financial advisory services.",
  ctaButton: "Connect With Us Today",
};

export const accountingServiceCategories: AccountingServiceCategory[] = [
  {
    id: "advisory-and-diligence",
    title: "Advisory & Due Diligence Services",
    services: [
      {
        id: "due-diligence",
        title: "Due Diligence",
        summary:
          "Due diligence is essential during investments, acquisitions, mergers, partnerships, funding transactions and strategic business decisions.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Financial due diligence",
          "Tax compliance review",
          "Legal and regulatory verification",
          "Risk assessment",
          "Operational analysis",
          "Documentation review",
        ],
        benefits: [
          "Better investment decisions",
          "Identification of financial risks",
          "Improved transaction transparency",
          "Regulatory compliance assessment",
          "Protection against future liabilities",
        ],
      },
      {
        id: "business-plan",
        title: "Business Plan",
        summary:
          "We assist startups, entrepreneurs and businesses in preparing professional business plans and financial models.",
        assistanceLabel: "Our Services",
        assistance: [
          "Business strategy formulation",
          "Revenue forecasting",
          "Financial projections",
          "Market feasibility analysis",
          "Investor presentation support",
        ],
        benefits: [
          "Better business clarity",
          "Funding and investor readiness",
          "Strategic growth planning",
          "Financial goal alignment",
        ],
      },
      {
        id: "term-sheet",
        title: "Term Sheet",
        summary:
          "We assist businesses, startups and investors in drafting and reviewing term sheets for investments and strategic transactions.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Funding structure advisory",
          "Investment documentation review",
          "Commercial term analysis",
          "Negotiation support",
        ],
        benefits: [
          "Clarity in investment terms",
          "Better investor protection",
          "Reduced transaction disputes",
          "Structured funding arrangements",
        ],
      },
    ],
  },
  {
    id: "working-capital",
    title: "Working Capital & Accounting Operations",
    services: [
      {
        id: "accounts-payable",
        title: "Accounts Payable Services",
        summary:
          "Our accounts payable solutions help businesses manage vendor payments, liabilities and financial workflows efficiently.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Invoice processing",
          "Vendor ledger management",
          "Payment scheduling",
          "Compliance review",
          "Reconciliation support",
        ],
        benefits: [
          "Improved cash flow management",
          "Better vendor relationships",
          "Reduced payment errors",
          "Streamlined financial operations",
        ],
      },
      {
        id: "accounts-receivable",
        title: "Accounts Receivable Services",
        summary:
          "We help businesses manage customer billing, collections, receivables tracking and outstanding payment monitoring.",
        assistanceLabel: "Our Services",
        assistance: [
          "Receivable tracking",
          "Customer invoicing",
          "Collection management",
          "Ageing analysis",
          "Reconciliation support",
        ],
        benefits: [
          "Faster collection cycles",
          "Improved working capital",
          "Better financial control",
          "Reduced bad debts",
        ],
      },
      {
        id: "bookkeeping-services",
        title: "Bookkeeping Services",
        summary:
          "Accurate bookkeeping is the foundation of effective financial management and compliance.",
        assistanceLabel: "Our Services",
        assistance: [
          "Daily accounting entries",
          "Ledger maintenance",
          "Bank reconciliation",
          "Financial statement preparation",
          "GST and tax accounting support",
        ],
        benefits: [
          "Accurate financial records",
          "Better compliance management",
          "Improved decision-making",
          "Organized accounting systems",
        ],
      },
    ],
  },
  {
    id: "audit-and-review",
    title: "Audit & Operational Review Services",
    services: [
      {
        id: "tax-audit",
        title: "Tax Audit",
        summary:
          "We provide professional tax audit services in compliance with the Income Tax Act and applicable regulatory requirements.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Tax audit reporting",
          "Financial statement verification",
          "Compliance review",
          "Audit documentation",
          "Representation support",
        ],
        benefits: [
          "Statutory tax compliance",
          "Accurate financial reporting",
          "Reduced litigation risks",
          "Improved financial transparency",
        ],
      },
      {
        id: "manufacturing-audit",
        title: "Manufacturing Audit",
        summary:
          "Manufacturing audits help businesses evaluate operational efficiency, compliance systems and production controls.",
        assistanceLabel: "Our Services",
        assistance: [
          "Process evaluation",
          "Production compliance review",
          "Inventory and workflow assessment",
          "Operational efficiency analysis",
        ],
        benefits: [
          "Improved production efficiency",
          "Better inventory management",
          "Reduced operational losses",
          "Enhanced compliance systems",
        ],
      },
      {
        id: "technical-audit",
        title: "Technical Audit",
        summary:
          "Technical audits evaluate operational systems, technical processes, infrastructure compliance and performance efficiency.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "System performance review",
          "Technical compliance assessment",
          "Infrastructure evaluation",
          "Risk identification",
        ],
        benefits: [
          "Improved technical efficiency",
          "Better compliance standards",
          "Reduced operational risks",
          "Enhanced system performance",
        ],
      },
      {
        id: "factory-sanitation-audit",
        title: "Factory Sanitation Audit",
        summary:
          "Factory sanitation audits assess workplace hygiene, sanitation systems and health compliance standards.",
        assistanceLabel: "Our Services",
        assistance: [
          "Sanitation inspection",
          "Hygiene compliance review",
          "Health and safety assessment",
          "Improvement recommendations",
        ],
        benefits: [
          "Better workplace hygiene",
          "Compliance with industrial safety standards",
          "Improved employee welfare",
          "Reduced health-related risks",
        ],
      },
      {
        id: "insurance-audit",
        title: "Insurance Audit",
        summary:
          "We provide insurance audit services for policy review, claims verification, compliance checks and risk analysis.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Insurance documentation review",
          "Policy compliance assessment",
          "Claim verification support",
          "Risk evaluation",
        ],
        benefits: [
          "Better insurance compliance",
          "Reduced claim disputes",
          "Financial risk mitigation",
          "Improved policy management",
        ],
      },
    ],
  },
  {
    id: "technology-and-reporting",
    title: "Technology & Reporting Solutions",
    services: [
      {
        id: "m2m-communications",
        title: "M2M Communications",
        summary:
          "We assist businesses in integrating M2M communication systems for operational monitoring, automation and reporting processes.",
        assistanceLabel: "Benefits",
        assistance: [
          "Improved operational automation",
          "Better system monitoring",
          "Enhanced data accuracy",
          "Increased operational efficiency",
        ],
        benefits: [
          "Improved operational automation",
          "Better system monitoring",
          "Enhanced data accuracy",
          "Increased operational efficiency",
        ],
      },
      {
        id: "mis-reporting",
        title: "MIS Reporting",
        summary:
          "MIS reporting provides businesses with structured financial and operational insights for strategic decision-making.",
        assistanceLabel: "Our Services",
        assistance: [
          "Customized MIS reporting",
          "Financial dashboards",
          "Performance analytics",
          "Operational reporting",
          "Data interpretation support",
        ],
        benefits: [
          "Better business decision-making",
          "Real-time financial insights",
          "Improved management control",
          "Strategic planning support",
        ],
      },
    ],
  },
  {
    id: "virtual-cfo",
    title: "Virtual CFO & Financial Advisory Support",
    services: [
      {
        id: "virtual-cfo-support",
        title: "Virtual CFO Support",
        summary:
          "Our accounting and CFO solutions provide financial leadership and strategic support without the cost of a full-time finance department.",
        assistanceLabel: "Our CFO Support Includes",
        assistance: [
          "Financial planning and analysis",
          "Cash flow management",
          "Budgeting and forecasting",
          "Compliance supervision",
          "Investor and lender coordination",
          "Internal financial controls",
          "Business restructuring advisory",
          "Strategic growth planning",
        ],
        benefits: [
          "Professional financial leadership",
          "Better decision-making support",
          "Improved governance and controls",
          "Cost-efficient CFO-level expertise",
        ],
      },
    ],
  },
];
