export type LegalServiceItem = {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
};

export type LegalServiceCategory = {
  id: string;
  title: string;
  services: LegalServiceItem[];
};

export const legalPageContent = {
  badge: "Contracts & Agreements Services",
  title: "Contracts & Agreements Services",
  subtitle: "Comprehensive Legal Documentation, Drafting & Registration Solutions",
  intro: [
    "At NCJ Legal Business Solutions LLP, we provide professional drafting, vetting, review, execution, and registration support for commercial contracts, business agreements, property documents, and legal instruments across India.",
    "Well-drafted agreements are essential for protecting legal rights, defining obligations, minimizing disputes, and ensuring enforceability under applicable laws. Whether for business transactions, investments, partnerships, property dealings, franchise operations, or personal asset transfers, legally sound documentation plays a critical role in long-term security and operational clarity.",
    "Our experienced legal professionals assist individuals, startups, corporates, investors, property owners, and enterprises in preparing customized agreements tailored to their commercial and legal requirements.",
  ],
  servicesHeading: "Our Contracts & Agreements Services",
  supportHeading: "Our Legal Documentation Support",
  supportText:
    "At NCJ Legal Business Solutions LLP, we provide complete assistance throughout the documentation and agreement lifecycle.",
  supportPoints: [
    "Agreement drafting & vetting",
    "Legal review and modification",
    "Negotiation support",
    "Stamp duty advisory",
    "Registration coordination",
    "Compliance verification",
    "Dispute prevention advisory",
    "Execution and documentation support",
  ],
  industriesHeading: "Industries & Clients We Serve",
  industries: [
    "Startups & Entrepreneurs",
    "Corporates & MSMEs",
    "Investors & Shareholders",
    "Franchise Businesses",
    "Property Owners & Developers",
    "Manufacturers & Traders",
    "Professionals & Consultants",
    "Family-Owned Businesses",
    "NRIs & Overseas Investors",
  ],
  whyChooseHeading: "Why Choose NCJ Legal Business Solutions LLP",
  whyChoosePoints: [
    "60+ Years of Professional Legal & Tax Experience",
    "Experienced Corporate & Property Law Professionals",
    "Customized Agreement Drafting Solutions",
    "End-to-End Registration Support",
    "Strong Legal Documentation Expertise",
    "Transparent & Professional Advisory",
    "PAN India Service Support",
  ],
  ctaTitle: "Secure Your Business & Property Transactions with Legally Strong Documentation",
  ctaText:
    "Whether you require commercial agreements, shareholder arrangements, franchise contracts, lease documentation, or property registration support, NCJ Legal Business Solutions LLP provides reliable and professionally structured legal documentation solutions tailored to your specific requirements.",
  ctaButton: "Connect With Us Today",
};

export const legalServiceCategories: LegalServiceCategory[] = [
  {
    id: "commercial-contracts",
    title: "Commercial Contracts & Business Agreements",
    services: [
      {
        id: "service-level-agreement",
        title: "Service Level Agreement",
        summary:
          "A Service Level Agreement (SLA) defines the scope, standards, timelines, responsibilities, and performance expectations between service providers and clients.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Customized SLA drafting",
          "Performance metric structuring",
          "Risk and liability clauses",
          "Confidentiality provisions",
          "Contract review and negotiation support",
        ],
        benefits: [
          "Clear definition of service obligations",
          "Reduced operational disputes",
          "Better accountability and transparency",
          "Protection of commercial interests",
        ],
      },
      {
        id: "share-purchase-agreement",
        title: "Share Purchase Agreement",
        summary:
          "A Share Purchase Agreement (SPA) governs the purchase and sale of shares in a company.",
        assistanceLabel: "Our Services",
        assistance: [
          "Transaction structuring",
          "Share transfer documentation",
          "Due diligence support",
          "Payment and indemnity clauses",
          "Regulatory compliance advisory",
        ],
        benefits: [
          "Legally secure share transactions",
          "Protection of buyer and seller interests",
          "Clarity in ownership transfer",
          "Reduced transaction risks",
        ],
      },
      {
        id: "shareholders-agreement",
        title: "Shareholder’s Agreement",
        summary:
          "A Shareholder’s Agreement defines rights, obligations, ownership structure, governance mechanisms, and dispute resolution among shareholders.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Shareholding structure advisory",
          "Voting rights and management clauses",
          "Exit and transfer restrictions",
          "Investor protection provisions",
          "Dispute resolution mechanisms",
        ],
        benefits: [
          "Better corporate governance",
          "Protection of shareholder interests",
          "Reduced future conflicts",
          "Clear business management framework",
        ],
      },
      {
        id: "franchise-agreement",
        title: "Franchise Agreement",
        summary:
          "Franchise Agreements regulate the relationship between franchisors and franchisees for business expansion and brand licensing.",
        assistanceLabel: "Our Services",
        assistance: [
          "Franchise model structuring",
          "Licensing and royalty clauses",
          "Territorial rights drafting",
          "Compliance and operational clauses",
          "Brand protection provisions",
        ],
        benefits: [
          "Legally protected franchise operations",
          "Clear business expansion framework",
          "Intellectual property protection",
          "Reduced operational disputes",
        ],
      },
    ],
  },
  {
    id: "property-documentation",
    title: "Property Documentation & Registration Services",
    services: [
      {
        id: "sale-deed-registration",
        title: "Sale Deed Registration",
        summary:
          "Sale Deed Registration is essential for legal transfer of ownership in immovable property transactions.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Sale deed drafting",
          "Stamp duty advisory",
          "Registration coordination",
          "Property document verification",
          "Legal compliance support",
        ],
        benefits: [
          "Legally valid ownership transfer",
          "Protection against property disputes",
          "Clear title documentation",
          "Compliance with registration laws",
        ],
      },
      {
        id: "gift-deed",
        title: "Gift Deed",
        summary:
          "A Gift Deed facilitates voluntary transfer of movable or immovable property without monetary consideration.",
        assistanceLabel: "Our Services",
        assistance: [
          "Gift deed drafting",
          "Family settlement advisory",
          "Registration support",
          "Stamp duty guidance",
        ],
        benefits: [
          "Legally recognized property transfer",
          "Smooth family asset transfer",
          "Reduced future inheritance disputes",
          "Proper legal documentation",
        ],
      },
      {
        id: "relinquishment-deed",
        title: "Relinquishment Deed",
        summary:
          "Relinquishment Deed is used when a legal heir or co-owner voluntarily releases rights in a property.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Drafting and legal review",
          "Ownership rights verification",
          "Registration support",
          "Family settlement coordination",
        ],
        benefits: [
          "Clear transfer of ownership rights",
          "Reduction of future legal disputes",
          "Proper legal recognition of release",
        ],
      },
      {
        id: "probate-of-will",
        title: "Probate of Will",
        summary:
          "Probate is the legal process through which a will is authenticated and executed under court supervision.",
        assistanceLabel: "Our Services",
        assistance: [
          "Probate petition drafting",
          "Court documentation support",
          "Legal representation coordination",
          "Estate documentation management",
        ],
        benefits: [
          "Legal recognition of the will",
          "Smooth estate transfer process",
          "Protection against inheritance disputes",
          "Court-authorized asset distribution",
        ],
      },
    ],
  },
  {
    id: "rental-lease",
    title: "Rental & Lease Agreement Services",
    services: [
      {
        id: "residential-rental-agreement",
        title: "Residential Rental Agreement",
        summary:
          "Residential rental agreements define terms and conditions between landlords and tenants for residential properties.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Agreement drafting",
          "Security deposit clauses",
          "Tenancy condition structuring",
          "Registration support",
          "Renewal and amendment assistance",
        ],
        benefits: [
          "Legal protection for landlords and tenants",
          "Clear tenancy terms",
          "Reduced rental disputes",
          "Proper documentation of occupancy rights",
        ],
      },
      {
        id: "commercial-rental-agreement",
        title: "Commercial Rental Agreement",
        summary:
          "Commercial lease agreements are designed for offices, shops, warehouses, factories, and business premises.",
        assistanceLabel: "Our Services",
        assistance: [
          "Commercial lease drafting",
          "Rent escalation and lock-in clauses",
          "Compliance and usage conditions",
          "Registration support",
        ],
        benefits: [
          "Protection of commercial interests",
          "Clear business occupancy rights",
          "Reduced operational disputes",
          "Structured leasing arrangements",
        ],
      },
    ],
  },
];