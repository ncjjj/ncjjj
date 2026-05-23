export type RegServiceItem = {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
};

export type RegServiceCategory = {
  id: string;
  title: string;
  services: RegServiceItem[];
};

export const regPageContent = {
  badge: "Government Registration Services",
  title: "Comprehensive Registration, Regulatory & Statutory Compliance Solutions",
  subtitle:
    "At NCJ Legal Business Solutions LLP, we provide complete assistance for government registrations, statutory approvals, regulatory filings, and sector-specific compliance services for businesses, exporters, startups, manufacturers, contractors, developers, associations, and organizations across India.",
  intro: [
    "Government registrations play a critical role in ensuring legal recognition, regulatory compliance, eligibility for incentives, market expansion, and smooth business operations.",
    "Our experienced professionals assist clients through every stage of registration, documentation, certification, and post-registration compliance management.",
    "We provide structured, transparent, and professionally managed registration solutions tailored to industry-specific requirements.",
  ],
  servicesHeading: "Our Government Registration Services",
  whyChooseHeading: "Why Choose NCJ Legal Business Solutions LLP",
  whyChoosePoints: [
    "60+ Years of Professional Legacy",
    "Specialized Regulatory & Compliance Experts",
    "PAN India Registration Support",
    "Industry-Specific Advisory Services",
    "End-to-End Documentation & Filing Assistance",
    "Transparent & Professional Process",
  ],
  ctaTitle: "Professional Registration Solutions for Modern Businesses",
  ctaText:
    "Whether you are a startup, exporter, manufacturer, contractor, developer, telecom operator, agricultural business, or growing enterprise, NCJ Legal Business Solutions LLP provides reliable and professional government registration services to help your business remain compliant, recognized, and growth-ready.",
  ctaButton: "Contact Us Today",
};

export const regServiceCategories: RegServiceCategory[] = [
  {
    id: "msme-iec-epf-esi",
    title: "Core Registrations & Labour",
    services: [
      {
        id: "msme",
        title: "MSME / Udyam Registration",
        summary:
          "Udyam registration provides official recognition to small and medium enterprises under the Government of India.",
        assistanceLabel: "Our Assistance",
        assistance: ["Udyam registration filing", "Classification advisory", "Documentation support", "Amendment and update assistance"],
        benefits: ["Access to government subsidies and schemes", "Easier bank financing", "Priority sector lending benefits", "Protection against delayed payments"],
      },
      {
        id: "iec",
        title: "IEC Registration",
        summary: "Mandatory for businesses engaged in import and export activities in India.",
        assistanceLabel: "Our Services",
        assistance: ["IEC application filing", "DGFT documentation support", "Modification and update assistance", "Compliance advisory"],
        benefits: ["Legal authorization for import-export business", "Access to international markets", "Export incentives and benefits", "Simplified customs clearance"],
      },
      {
        id: "epf",
        title: "EPF Registration",
        summary: "EPF registration is mandatory for eligible establishments employing workers under labour laws.",
        assistanceLabel: "Our Assistance",
        assistance: ["EPFO registration", "Employer compliance setup", "Employee onboarding support", "Monthly compliance guidance"],
        benefits: ["Statutory labour compliance", "Employee social security benefits", "Improved organizational credibility", "Avoidance of penalties"],
      },
      {
        id: "esi",
        title: "ESI Registration",
        summary: "ESI registration provides medical and insurance benefits to employees under the ESI Act.",
        assistanceLabel: "Our Services",
        assistance: ["Employer registration", "Employee enrollment support", "Compliance advisory", "Return filing guidance"],
        benefits: ["Employee medical security", "Statutory compliance", "Social welfare protection", "Reduced legal risks"],
      },
    ],
  },

  {
    id: "real-estate-construction",
    title: "Real Estate & Construction",
    services: [
      {
        id: "rera",
        title: "RERA Registration",
        summary: "End-to-end assistance for RERA registration of real estate projects and developers.",
        assistanceLabel: "Our Assistance",
        assistance: ["Documentation support", "Project registration filing", "Regulatory compliance advisory", "Renewal and amendment support"],
        benefits: ["Legal project marketing and sales", "Buyer confidence enhancement", "Regulatory compliance", "Protection from penalties"],
      },
      {
        id: "rera-agent",
        title: "RERA Registration for Agents",
        summary: "RERA registration is mandatory for property dealers and real estate agents operating in regulated markets.",
        assistanceLabel: "Benefits",
        assistance: ["Registration support"],
        benefits: ["Legal authorization to operate", "Increased customer trust", "Professional market recognition"],
      },
      {
        id: "building-noc",
        title: "Building NOC",
        summary: "Building NOC approvals are required from multiple departments before construction and operation of commercial or industrial premises.",
        assistanceLabel: "Our Services",
        assistance: ["NOC coordination", "Documentation support", "Liaison with authorities", "Compliance advisory"],
        benefits: ["Legal construction approvals", "Operational compliance", "Avoidance of regulatory disputes"],
      },
      {
        id: "bocw",
        title: "BOCW Act Registration",
        summary: "BOCW registration is mandatory for construction establishments and contractors.",
        assistanceLabel: "Our Assistance",
        assistance: ["Registration filing", "Labour welfare compliance", "Documentation support", "Renewal management"],
        benefits: ["Compliance with labour welfare laws", "Eligibility for government benefits", "Legal operational protection"],
      },
    ],
  },

  {
    id: "export-trade",
    title: "Export Promotion & Trade",
    services: [
      {
        id: "fieo",
        title: "FIEO Registration",
        summary: "FIEO registration supports exporters through government-recognized export promotion services.",
        assistanceLabel: "Benefits",
        assistance: ["Registration support"],
        benefits: ["Export assistance and guidance", "International trade support", "Global networking opportunities"],
      },
      {
        id: "apeda",
        title: "APEDA Registration",
        summary: "APEDA registration is mandatory for exporters of agricultural and processed food products.",
        assistanceLabel: "Our Assistance",
        assistance: ["APEDA application filing", "Product category advisory", "Export documentation support"],
        benefits: ["Export authorization", "Government export incentives", "International market access"],
      },
      {
        id: "spice-board",
        title: "Spice Board Registration",
        summary: "Spice Board registration for spice exporters and traders.",
        assistanceLabel: "Benefits",
        assistance: ["Registration support"],
        benefits: ["Export eligibility", "Trade support and incentives", "International credibility"],
      },
      {
        id: "gsp",
        title: "GSP Certificate",
        summary: "GSP certification enables exporters to claim preferential duty benefits in importing countries.",
        assistanceLabel: "Benefits",
        assistance: ["Certification support"],
        benefits: ["Reduced customs duties", "Competitive export pricing", "Enhanced export opportunities"],
      },
      {
        id: "gacc",
        title: "GACC Registration",
        summary: "GACC registration is essential for exporters supplying products to China.",
        assistanceLabel: "Our Assistance",
        assistance: ["Product registration support", "Documentation management", "Compliance coordination"],
        benefits: ["Access to Chinese markets", "Regulatory approval for exports", "International trade expansion"],
      },
    ],
  },

  {
    id: "industrial-product",
    title: "Industrial & Product Registrations",
    services: [
      {
        id: "nsic",
        title: "NSIC Registration",
        summary: "NSIC registration provides benefits to MSMEs participating in government procurement and industrial schemes.",
        assistanceLabel: "Benefits",
        assistance: ["Registration support"],
        benefits: ["Tender participation benefits", "Government procurement support", "Financial assistance schemes"],
      },
      {
        id: "bee",
        title: "BEE Certification",
        summary: "BEE certification is mandatory for energy-efficient appliances and products.",
        assistanceLabel: "Our Services",
        assistance: ["Product compliance support", "Testing coordination", "Certification documentation"],
        benefits: ["Energy efficiency compliance", "Consumer trust enhancement", "Regulatory approval"],
      },
      {
        id: "barcode",
        title: "Barcode Registration",
        summary: "Barcode registration enables businesses to sell products through organized retail and e-commerce platforms.",
        assistanceLabel: "Benefits",
        assistance: ["Registration guidance"],
        benefits: ["Product identification", "Inventory management efficiency", "Retail and online marketplace access"],
      },
      {
        id: "wmi",
        title: "World Manufacturer Identifier (WMI) Code",
        summary: "WMI code registration is essential for vehicle manufacturers and automotive industries.",
        assistanceLabel: "Benefits",
        assistance: ["Registration support"],
        benefits: ["Global manufacturer identification", "Automotive industry compliance", "International market recognition"],
      },
      {
        id: "trusted-telecom",
        title: "Trusted Telecom Approval",
        summary: "Trusted Telecom approval is required for telecom equipment suppliers under national security regulations.",
        assistanceLabel: "Benefits",
        assistance: ["Approval coordination"],
        benefits: ["Telecom market eligibility", "Regulatory compliance", "Government project participation"],
      },
      {
        id: "pm-wani",
        title: "PM-WANI Registration",
        summary: "PM-WANI registration enables businesses to provide public Wi-Fi services under government regulations.",
        assistanceLabel: "Our Assistance",
        assistance: ["Registration filing", "DOT compliance support", "Network compliance advisory"],
        benefits: ["Legal public Wi-Fi operations", "Digital business opportunities", "Telecom regulatory compliance"],
      },
    ],
  },

  {
    id: "agri-import",
    title: "Agriculture, Organic & Import Registrations",
    services: [
      {
        id: "sanitary-import",
        title: "Sanitary Import Permit",
        summary: "Sanitary Import Permit is mandatory for import of agricultural and biological products.",
        assistanceLabel: "Benefits",
        assistance: ["Permit support"],
        benefits: ["Legal import authorization", "Compliance with quarantine regulations", "Smooth customs clearance"],
      },
      {
        id: "npop",
        title: "NPOP Certification",
        summary: "NPOP certification is required for organic product manufacturers and exporters.",
        assistanceLabel: "Our Assistance",
        assistance: ["Organic certification assistance", "Documentation support", "Compliance advisory"],
        benefits: ["Organic product recognition", "Export opportunities", "Consumer confidence"],
      },
      {
        id: "coconut-board",
        title: "Coconut Board Registration",
        summary: "Registration for coconut growers, processors, and exporters.",
        assistanceLabel: "Benefits",
        assistance: ["Registration support"],
        benefits: ["Government scheme access", "Export and marketing support", "Agricultural development incentives"],
      },
    ],
  },

  {
    id: "media-tech-special",
    title: "Media, Technology & Specialized Registrations",
    services: [
      {
        id: "rni",
        title: "RNI Registration",
        summary: "RNI registration is mandatory for newspapers, journals, and periodical publications in India.",
        assistanceLabel: "Our Assistance",
        assistance: ["Title verification", "Registration filing", "Documentation coordination"],
        benefits: ["Legal publication rights", "Government recognition", "Publishing compliance"],
      },
      {
        id: "drone",
        title: "Drone Registration",
        summary: "Drone registration is mandatory for drone operators, importers, and commercial drone businesses.",
        assistanceLabel: "Benefits",
        assistance: ["Registration support"],
        benefits: ["Legal drone operations", "DGCA compliance", "Commercial usage authorization"],
      },
      {
        id: "political-party",
        title: "Political Party Registration",
        summary: "Consultancy and legal support for registration of political parties before the Election Commission of India.",
        assistanceLabel: "Our Assistance",
        assistance: ["Constitution drafting", "Documentation support", "Registration filing", "Compliance advisory"],
        benefits: ["Official political recognition", "Election participation eligibility", "Regulatory compliance"],
      },
    ],
  },

  {
    id: "compliance-returns",
    title: "Compliance & Return Filing",
    services: [
      {
        id: "msme-return",
        title: "MSME Return Filing",
        summary: "Assistance in filing mandatory MSME returns related to outstanding dues payable to MSMEs.",
        assistanceLabel: "Benefits",
        assistance: ["Filing support"],
        benefits: ["Statutory compliance", "Avoidance of penalties", "Better vendor compliance management"],
      },
    ],
  },
];
