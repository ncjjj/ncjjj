export type NgoServiceItem = {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
};

export type NgoServiceCategory = {
  id: string;
  title: string;
  services: NgoServiceItem[];
};

export const ngoPageContent = {
  badge: "NGO & Charitable Organizations",
  title: "NGO & Charitable Organization Compliance Services",
  subtitle:
    "Comprehensive Legal, Taxation & Regulatory Solutions for NGOs, Trusts, Societies & Section 8 Companies",
  intro: [
    "At NCJ Legal Business Solutions LLP, we provide end-to-end consultancy, registration, taxation, compliance, and advisory services for Non-Governmental Organizations (NGOs), Charitable Trusts, Societies, and Section 8 Companies across India.",
    "With decades of professional experience in legal, taxation, and regulatory compliance, our team assists organizations in establishing a strong legal foundation, securing tax exemptions, obtaining government approvals, and maintaining complete statutory compliance.",
    "We work with charitable institutions, educational organizations, healthcare foundations, religious trusts, social welfare societies, CSR implementing agencies, and international donor-supported organizations.",
  ],
  servicesHeading: "Our NGO & Charitable Organization Services",
  whyChooseHeading: "Why Choose NCJ Legal Business Solutions LLP",
  whyChoosePoints: [
    "60+ Years of Professional Legacy",
    "Experienced Tax & Legal Professionals",
    "End-to-End NGO Compliance Solutions",
    "PAN India Service Network",
    "Dedicated Advisory Support",
    "Transparent & Professional Process",
    "Expertise in Taxation, ROC & Regulatory Matters",
  ],
  ctaTitle: "Build Your NGO with Legal Strength & Financial Transparency",
  ctaText:
    "Whether you are starting a charitable organization, seeking tax exemptions, applying for CSR funding, or managing ongoing compliance, NCJ Legal Business Solutions LLP provides complete professional support at every stage.",
  ctaButton: "Contact Us Today",
};

export const ngoServiceCategories: NgoServiceCategory[] = [
  {
    id: "registration",
    title: "Registration Services",
    services: [
      {
        id: "ngo-registration",
        title: "NGO Registration",
        summary:
          "We assist in establishing legally recognized NGOs in India through appropriate legal structures based on the objectives and operational requirements of the organization.",
        assistanceLabel: "Our Assistance Includes",
        assistance: [
          "Selection of suitable legal structure",
          "Documentation drafting",
          "Legal advisory",
          "Registration filing",
          "Government liaison support",
          "PAN & compliance assistance",
        ],
        benefits: [
          "Legal identity for the organization",
          "Eligibility for grants and funding",
          "Ability to open bank accounts",
          "Recognition by government authorities",
          "Enhanced credibility and transparency",
        ],
      },
      {
        id: "section-8",
        title: "Section 8 Company Registration",
        summary:
          "A Section 8 Company is the most structured and professionally governed form of NGO registration under the Companies Act, 2013.",
        assistanceLabel: "Our Services Include",
        assistance: [
          "Name approval and incorporation",
          "Drafting MOA & AOA",
          "DIN & DSC assistance",
          "ROC filings",
          "Compliance framework setup",
          "Post incorporation advisory",
        ],
        benefits: [
          "High credibility among donors and CSR contributors",
          "Separate legal entity status",
          "Better governance structure",
          "Limited liability protection",
          "Preferred structure for large-scale NGOs",
        ],
      },
      {
        id: "society",
        title: "Society Registration",
        summary:
          "Society registration is suitable for charitable groups, educational institutions, welfare associations, and community organizations.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Drafting Memorandum & Rules",
          "Member documentation",
          "Registrar filing support",
          "Compliance advisory",
          "Amendment and renewal support",
        ],
        benefits: [
          "Legal recognition",
          "Democratic management structure",
          "Easier operational flexibility",
          "Suitable for community welfare activities",
        ],
      },
      {
        id: "trust",
        title: "Trust Registration",
        summary:
          "We provide complete assistance in formation and registration of Public Charitable Trusts and Religious Trusts.",
        assistanceLabel: "Our Services",
        assistance: [
          "Trust deed drafting",
          "Stamp duty advisory",
          "Registration process management",
          "Trustee compliance guidance",
          "PAN & bank account assistance",
        ],
        benefits: [
          "Legal protection of charitable assets",
          "Structured management of donations",
          "Long-term continuity of charitable objectives",
          "Tax exemption eligibility",
        ],
      },
    ],
  },
  {
    id: "income-tax",
    title: "Income Tax Registrations & Exemptions",
    services: [
      {
        id: "12a",
        title: "12A / 12AA / 12AB Registration",
        summary:
          "Registration under Sections 12A/12AB allows NGOs to claim exemption on income applied towards charitable purposes.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Documentation preparation",
          "Income Tax portal filing",
          "Drafting activity notes",
          "Representation before authorities",
          "Renewal and modification filings",
          "Compliance advisory",
        ],
        benefits: [
          "Income tax exemption for NGO",
          "Improved donor confidence",
          "Eligibility for grants and CSR funding",
          "Recognition as a charitable institution",
        ],
      },
      {
        id: "80g",
        title: "80G Registration",
        summary:
          "80G registration enables donors to claim tax deductions on donations made to the NGO.",
        assistanceLabel: "Our Services",
        assistance: [
          "Application drafting",
          "Documentation and compliance review",
          "Income Tax filing support",
          "Departmental representation",
        ],
        benefits: [
          "Increases donor participation",
          "Enhances fundraising capability",
          "Tax deduction benefits to contributors",
          "Greater institutional credibility",
        ],
      },
      {
        id: "10-23c",
        title: "Section 10(23C)",
        summary:
          "We assist educational institutions, hospitals, and charitable organizations in obtaining approval under Section 10(23C).",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Eligibility analysis",
          "Documentation drafting",
          "Filing and departmental representation",
          "Compliance structuring",
        ],
        benefits: [
          "Income tax exemption",
          "Suitable for large charitable institutions",
          "Long-term financial sustainability",
        ],
      },
    ],
  },
  {
    id: "foreign-funding",
    title: "Foreign Funding & Government Recognition",
    services: [
      {
        id: "fcra",
        title: "FCRA Registration",
        summary:
          "FCRA registration is mandatory for NGOs intending to receive foreign donations or international grants.",
        assistanceLabel: "Our Services",
        assistance: [
          "FCRA registration & prior permission",
          "Documentation management",
          "Compliance advisory",
          "Annual return filing",
          "Bank account compliance support",
        ],
        benefits: [
          "Legal receipt of foreign donations",
          "Access to international funding opportunities",
          "Global collaboration possibilities",
          "Regulatory transparency",
        ],
      },
      {
        id: "ngo-darpan",
        title: "NGO Darpan Registration",
        summary:
          "NGO Darpan registration is essential for obtaining grants and recognition from government departments.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Portal registration",
          "Documentation upload",
          "Profile creation and verification",
          "Ongoing update support",
        ],
        benefits: [
          "Government recognition",
          "Eligibility for government grants",
          "Enhanced transparency",
          "Improved institutional profile",
        ],
      },
    ],
  },
  {
    id: "csr",
    title: "CSR Related Services",
    services: [
      {
        id: "csr-1",
        title: "CSR-1 Filing",
        summary:
          "CSR-1 registration is mandatory for NGOs intending to receive CSR funding from companies.",
        assistanceLabel: "Our Services",
        assistance: [
          "CSR-1 filing",
          "MCA compliance support",
          "Documentation and certification coordination",
          "Advisory on CSR eligibility",
        ],
        benefits: [
          "Eligibility to receive CSR funds",
          "Corporate partnership opportunities",
          "Increased funding access",
          "Regulatory compliance",
        ],
      },
      {
        id: "csr-consultancy",
        title: "NGO CSR Consultancy",
        summary:
          "We provide strategic consultancy for NGOs seeking CSR partnerships and funding opportunities.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "CSR project structuring",
          "Corporate engagement support",
          "Proposal drafting",
          "Compliance monitoring",
          "Utilization advisory",
        ],
        benefits: [
          "Professional CSR alignment",
          "Better funding opportunities",
          "Improved project implementation",
          "Long-term corporate relationships",
        ],
      },
    ],
  },
  {
    id: "compliance",
    title: "Compliance, Advisory & Financial Services",
    services: [
      {
        id: "income-tax-advisory",
        title: "NGO Income Tax Advisory",
        summary:
          "We offer specialized taxation advisory for charitable organizations and non-profit entities.",
        assistanceLabel: "Our Services",
        assistance: [
          "Income tax planning",
          "Return filing",
          "Assessment support",
          "Tax exemption advisory",
          "Litigation support",
        ],
        benefits: [
          "Reduced compliance risks",
          "Proper utilization of exemptions",
          "Improved financial governance",
          "Regulatory protection",
        ],
      },
      {
        id: "accounting",
        title: "NGO Accounting",
        summary:
          "Proper accounting is essential for transparency, donor confidence, and statutory compliance.",
        assistanceLabel: "Our Services",
        assistance: [
          "Bookkeeping",
          "Financial statement preparation",
          "Grant accounting",
          "Audit coordination",
          "Compliance reporting",
        ],
        benefits: [
          "Financial transparency",
          "Better donor confidence",
          "Easier audit compliance",
          "Improved fund management",
        ],
      },
      {
        id: "project-report",
        title: "NGO Project Report",
        summary:
          "We assist NGOs in preparing professional project reports and funding proposals.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "DPR preparation",
          "Funding proposals",
          "CSR project documentation",
          "Budget planning",
          "Utilization reports",
        ],
        benefits: [
          "Better funding approval chances",
          "Professional presentation",
          "Structured project execution",
          "Improved donor communication",
        ],
      },
      {
        id: "annual-compliance",
        title: "Trust Annual Compliance",
        summary:
          "We provide complete annual compliance management for NGOs, trusts, societies, and Section 8 companies.",
        assistanceLabel: "Our Services",
        assistance: [
          "Annual return filings",
          "Income tax compliance",
          "ROC compliance",
          "Audit coordination",
          "Regulatory updates",
          "Documentation maintenance",
        ],
        benefits: [
          "Avoidance of penalties",
          "Continuous legal validity",
          "Smooth operational functioning",
          "Better governance standards",
        ],
      },
      {
        id: "strike-off",
        title: "Strike Off of Section 8 Companies",
        summary:
          "We assist dormant or inactive Section 8 Companies in legally closing operations through proper strike-off procedures.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Legal advisory",
          "ROC filing support",
          "Documentation management",
          "Compliance closure",
          "Regulatory representation",
        ],
        benefits: [
          "Legal closure of inactive entity",
          "Avoidance of future penalties",
          "Compliance completion",
          "Peaceful exit process",
        ],
      },
    ],
  },
];
