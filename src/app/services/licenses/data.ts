export type GovServiceItem = {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
};

export type GovServiceCategory = {
  id: string;
  title: string;
  services: GovServiceItem[];
};

export const govPageContent = {
  badge: "Government Licenses & Regulatory Approvals",
  title: "Government Licensing & Certification Services",
  subtitle:
    "Complete consultancy and end-to-end assistance for obtaining government licenses, statutory approvals, industrial certifications, and sector-specific regulatory registrations across India.",
  intro: [
    "At NCJ Legal Business Solutions LLP, we provide specialized consultancy and end-to-end assistance for obtaining government licenses, statutory approvals, industrial certifications, and sector-specific regulatory registrations across India.",
    "Our experienced legal and compliance professionals assist businesses in obtaining approvals efficiently while ensuring full compliance with applicable laws, regulatory standards, and departmental procedures.",
  ],
  servicesHeading: "Our Government Licensing & Certification Services",
  whyChooseHeading: "Why Choose NCJ Legal Business Solutions LLP",
  whyChoosePoints: [
    "60+ Years of Professional Experience",
    "Specialized Licensing & Regulatory Experts",
    "Industry-Specific Compliance Solutions",
    "PAN India Professional Support",
    "End-to-End Documentation & Filing Assistance",
    "Transparent & Efficient Process Management",
  ],
  ctaTitle: "Simplifying Regulatory Compliance for Modern Businesses",
  ctaText:
    "From startups and manufacturers to telecom operators, exporters, healthcare businesses, and industrial enterprises, we provide reliable, professional, and comprehensive licensing solutions to help businesses operate legally and efficiently across India.",
  ctaButton: "Contact Us Today",
};

export const govServiceCategories: GovServiceCategory[] = [
  {
    id: "local-licenses",
    title: "Local Licenses & Operational Permissions",
    services: [
      {
        id: "shop-establishment",
        title: "Shop & Establishment License",
        summary:
          "Mandatory registration for commercial establishments, shops, offices and service businesses; ensures compliance with local labour and employment rules.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Registration filing",
          "Documentation support",
          "Labour law advisory",
          "Amendment and renewal support",
          "Compliance guidance",
        ],
        benefits: [
          "Legal recognition of business establishment",
          "Compliance with labour regulations",
          "Essential for bank accounts and business registrations",
          "Avoidance of penalties",
        ],
      },
      {
        id: "trade-license",
        title: "Trade License",
        summary:
          "Issued by municipal authorities for conducting specific business activities within a jurisdiction; required for many commercial operations.",
        assistanceLabel: "Our Assistance",
        assistance: ["Application drafting", "Departmental liaison", "Documentation assistance", "Renewal and compliance support"],
        benefits: ["Legal authorization for business operations", "Regulatory compliance", "Improved business credibility", "Prevention of municipal penalties"],
      },
      {
        id: "health-trade-license",
        title: "Health Trade License",
        summary:
          "Mandatory for businesses dealing with food, healthcare, hospitality, and public-health sensitive activities; ensures consumer safety compliance.",
        assistanceLabel: "Our Assistance",
        assistance: ["License application support", "Health department coordination", "Inspection advisory", "Compliance management"],
        benefits: ["Legal approval for health-sensitive businesses", "Consumer trust and safety assurance", "Compliance with public health standards"],
      },
      {
        id: "factory-license",
        title: "Factory License",
        summary: "Mandatory for manufacturing units under the Factories Act with worker safety and operational compliance requirements.",
        assistanceLabel: "Our Assistance",
        assistance: ["Factory registration", "Labour and safety compliance", "Inspectorate coordination", "Renewal and amendment support"],
        benefits: ["Legal operation of manufacturing units", "Worker safety compliance", "Protection against legal liabilities", "Industrial regulation compliance"],
      },
      {
        id: "peso",
        title: "PESO Certification",
        summary: "Approval required for businesses dealing with petroleum, gas cylinders, explosives and hazardous materials to ensure industrial safety.",
        assistanceLabel: "Our Assistance",
        assistance: ["Licensing support", "Safety compliance advisory", "Technical documentation", "Regulatory coordination"],
        benefits: ["Legal operational approval", "Industrial safety compliance", "Protection against penalties", "Enhanced operational security"],
      },
    ],
  },

  {
    id: "product-certifications",
    title: "Product & Industrial Certifications",
    services: [
      {
        id: "ce-certification",
        title: "CE Certification",
        summary: "Enables manufacturers to market products within the European Economic Area by demonstrating conformity with EU requirements.",
        assistanceLabel: "Our Assistance",
        assistance: ["Product compliance evaluation", "Technical documentation support", "Testing coordination", "Certification guidance"],
        benefits: ["Access to European markets", "International product credibility", "Compliance with EU standards", "Improved export opportunities"],
      },
      {
        id: "fda-certification",
        title: "FDA Certification",
        summary: "Essential for food, pharmaceutical, cosmetic and healthcare products for regulatory approval and export readiness.",
        assistanceLabel: "Our Assistance",
        assistance: ["Regulatory documentation", "Product compliance advisory", "Registration support", "Inspection coordination"],
        benefits: ["Enhanced product credibility", "Regulatory approval for exports", "Consumer confidence", "Market expansion opportunities"],
      },
      {
        id: "gmp",
        title: "GMP Certification",
        summary: "Ensures consistent manufacturing quality and compliance with Good Manufacturing Practices across production facilities.",
        assistanceLabel: "Our Assistance",
        assistance: ["GMP documentation support", "Compliance framework setup", "Audit preparation", "Certification coordination"],
        benefits: ["Improved manufacturing quality", "Better market reputation", "Compliance with industry standards", "Export eligibility enhancement"],
      },
      {
        id: "ayush",
        title: "AYUSH License",
        summary: "Mandatory for manufacturing and marketing Ayurvedic, Unani, Siddha and Herbal products in India.",
        assistanceLabel: "Our Assistance",
        assistance: ["License application support", "Product documentation", "Regulatory compliance advisory", "Departmental representation"],
        benefits: ["Legal authorization for AYUSH products", "Market credibility", "Regulatory protection", "Business expansion opportunities"],
      },
    ],
  },

  {
    id: "telecom-technology",
    title: "Telecom & Technology Regulatory Services",
    services: [
      {
        id: "wpc",
        title: "WPC Certification & Customs Clearance",
        summary: "Regulatory approval for wireless equipment and customs clearance coordination for telecom devices and radio equipment.",
        assistanceLabel: "Our Assistance",
        assistance: ["Regulatory filing", "Testing coordination", "Customs clearance liaison", "Documentation support"],
        benefits: ["Regulatory compliance", "Smooth import and market entry", "Customs clearance support"],
      },
      {
        id: "tec",
        title: "TEC Certification",
        summary: "Mandatory certification for telecom equipment under Indian telecom regulations to ensure safety and interoperability.",
        assistanceLabel: "Our Assistance",
        assistance: ["Product compliance support", "Testing coordination", "Documentation management", "Certification filing"],
        benefits: ["Telecom regulatory compliance", "Product approval for Indian market", "Increased business credibility"],
      },
      {
        id: "nasscom",
        title: "NASSCOM Membership",
        summary: "Assistance for IT and technology companies to obtain NASSCOM membership and industry recognition.",
        assistanceLabel: "Our Assistance",
        assistance: ["Membership application", "Documentation support", "Industry representation"],
        benefits: ["Industry networking opportunities", "Business credibility", "Access to policy and industry support"],
      },
      {
        id: "dot-osp",
        title: "DOT OSP Compliance",
        summary: "Compliance support for OSPs, BPOs and IT-enabled service providers operating telecom-enabled services in India.",
        assistanceLabel: "Our Assistance",
        assistance: ["Compliance structuring", "Documentation support", "Regulatory advisory", "Reporting compliance"],
        benefits: ["Legal telecom operations", "Regulatory clarity", "Smooth business functioning"],
      },
      {
        id: "ip1",
        title: "IP-1 License",
        summary: "Registration required for telecom infrastructure providers and vendors operating within India's telecom ecosystem.",
        assistanceLabel: "Our Assistance",
        assistance: ["Registration assistance", "DOT compliance support", "Documentation drafting", "Regulatory advisory"],
        benefits: ["Legal telecom infrastructure operations", "Eligibility for telecom projects", "Industry recognition"],
      },
      {
        id: "fifp",
        title: "FIFP Approval",
        summary: "Assistance for foreign investment approvals and clearances under telecom-related FIFP provisions for market entry.",
        assistanceLabel: "Our Assistance",
        assistance: ["Approval coordination", "Regulatory filing", "Compliance advisory"],
        benefits: ["Regulatory approval for foreign investment", "Compliance with telecom sector regulations", "Smooth market entry in India"],
      },
    ],
  },

  {
    id: "media-broadcast",
    title: "Media, Broadcasting & Digital Communication",
    services: [
      {
        id: "mso",
        title: "MSO License",
        summary: "Required for cable TV and broadcasting service providers; includes application and ministry coordination.",
        assistanceLabel: "Our Assistance",
        assistance: ["License application", "Regulatory documentation", "Ministry coordination", "Compliance support"],
        benefits: ["Legal broadcasting operations", "Regulatory authorization", "Market expansion capability"],
      },
      {
        id: "hits-operator",
        title: "HITS Operator Licensing",
        summary: "Assistance for HITS operator licensing and regulatory approvals in broadcasting and satellite communication sectors.",
        assistanceLabel: "Our Assistance",
        assistance: ["Application support", "Regulatory coordination", "Documentation management"],
        benefits: ["Authorized satellite broadcasting operations", "Regulatory compliance", "Industry recognition"],
      },
    ],
  },

  {
    id: "automotive-imports",
    title: "Automotive, Electronics & Import Compliance",
    services: [
      {
        id: "homologation",
        title: "Homologation Certificate",
        summary: "Ensures imported or manufactured vehicles comply with Indian safety and technical standards for sale and registration.",
        assistanceLabel: "Our Assistance",
        assistance: ["Technical compliance support", "Testing coordination", "Certification documentation", "Regulatory advisory"],
        benefits: ["Legal sale and import of vehicles", "Automotive compliance", "Faster market approval"],
      },
      {
        id: "vehicle-type-approval",
        title: "Vehicle Type Approval",
        summary: "Mandatory approval for automotive manufacturers and importers to commercially distribute vehicles in India.",
        assistanceLabel: "Our Assistance",
        assistance: ["Testing coordination", "Documentation support", "Certification filing"],
        benefits: ["Product approval for Indian market", "Regulatory compliance", "Legal commercial distribution"],
      },
      {
        id: "imei-registration",
        title: "IMEI Number Registration",
        summary: "IMEI registration is essential for importers and manufacturers of mobile devices to comply with telecom regulations.",
        assistanceLabel: "Our Assistance",
        assistance: ["IMEI database registration", "Import documentation support", "Compliance advisory"],
        benefits: ["Legal import and sale of mobile devices", "Telecom compliance", "Customs clearance support"],
      },
      {
        id: "imei-import-certificate",
        title: "IMEI Certificate for Import of Mobile Handsets",
        summary: "Support for obtaining mandatory approvals and certifications for importing mobile handsets into India.",
        assistanceLabel: "Our Assistance",
        assistance: ["Approval coordination", "Documentation support", "Regulatory advisory"],
        benefits: ["Smooth import process", "Compliance with telecom regulations", "Legal market entry"],
      },
    ],
  },

  {
    id: "export-registrations",
    title: "Export Promotion & Industry Registrations",
    services: [
      {
        id: "capexil",
        title: "CAPEXIL Certificate",
        summary: "Assistance for exporters to obtain CAPEXIL registration for export promotion benefits and support.",
        assistanceLabel: "Our Assistance",
        assistance: ["Application support", "Documentation guidance", "Registration liaison"],
        benefits: ["Export incentives", "Government recognition for exporters", "International trade support"],
      },
      {
        id: "gjepc",
        title: "GJEPC Certificate",
        summary: "Registration support for gems & jewellery exporters to access export benefits and industry networks.",
        assistanceLabel: "Our Assistance",
        assistance: ["Registration assistance", "Documentation support", "Export advisory"],
        benefits: ["Export promotion benefits", "International trade opportunities", "Industry recognition"],
      },
      {
        id: "rdso",
        title: "RDSO Vendor Registration",
        summary: "Vendor registration for suppliers to Indian Railways through RDSO approvals and technical coordination.",
        assistanceLabel: "Our Assistance",
        assistance: ["Vendor approval support", "Technical documentation", "Regulatory coordination"],
        benefits: ["Eligibility for railway tenders", "Government procurement opportunities", "Vendor recognition"],
      },
      {
        id: "khadi",
        title: "Khadi Board Registration",
        summary: "Registration for rural enterprises and artisans to access government schemes, subsidies and market development support.",
        assistanceLabel: "Our Assistance",
        assistance: ["Registration support", "Scheme application", "Documentation assistance"],
        benefits: ["Access to government subsidies", "Rural business recognition", "Financial assistance opportunities", "Market development support"],
      },
    ],
  },
  {
    id: "food-safety",
    title: "Food Safety & FSSAI Services",
    services: [
      {
        id: "fssai-eating-house",
        title: "FSSAI & Eating House License Services",
        summary:
          "Comprehensive consultancy and end-to-end assistance for FSSAI registrations, food business licenses, eating house approvals, food safety compliance and regulatory certifications across India.",
        assistanceLabel: "Our Assistance",
        assistance: [
          "Eligibility assessment and license category selection",
          "Documentation preparation and filing",
          "Online application submission and departmental coordination",
          "Inspection advisory, police/local authority liaison for Eating House approvals",
          "Renewal, modification and compliance reviews",
          "FSSAI annual return preparation and filing guidance",
          "Product approval, label compliance and ingredient review",
          "Food recycling and environmental compliance advisory",
          "FPO mark certification support for fruit/processed products",
        ],
        benefits: [
          "Legal authorisation for food business operations",
          "Compliance with food safety laws and reduced regulatory risk",
          "Enhanced consumer trust and market credibility",
          "Eligibility for retail, organised trade and online platforms",
          "Support for interstate (Central) licensing and import-export eligibility",
          "Protection against penalties and smoother inspections",
          "Sustainable operations and environmental conformity for recycling businesses",
          "Improved product recognition through FPO certification",
        ],
      },
    ],
  },
];
