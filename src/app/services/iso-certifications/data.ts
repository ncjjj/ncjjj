export type IsoServiceItem = {
  id: string;
  title: string;
  summary: string;
  assistanceLabel: string;
  assistance: string[];
  benefits: string[];
};

export type IsoServiceCategory = {
  id: string;
  title: string;
  services: IsoServiceItem[];
};

export const isoPageContent = {
  badge: "ISO Certification Services",
  title: "International Standards, Quality Compliance & Business Excellence Solutions",
  subtitle:
    "At NCJ Legal Business Solutions LLP, we provide professional consultancy and end-to-end assistance for ISO certifications and international management system standards across diverse industries and business sectors.",
  intro: [
    "ISO certifications help organizations establish internationally recognized standards for quality management, environmental responsibility, data security, workplace safety, operational efficiency, risk management, and regulatory compliance.",
    "Our experienced compliance professionals assist businesses throughout the certification process including documentation, implementation, audit preparation, compliance structuring, certification coordination, and post-certification support.",
  ],
  servicesHeading: "Our ISO Certification Services",
  whyChooseHeading: "Why Choose NCJ Legal Business Solutions LLP",
  whyChoosePoints: [
    "60+ Years of Professional Experience",
    "Expert ISO Compliance Consultants",
    "Industry-Specific Certification Solutions",
    "PAN India Professional Support",
    "Complete Documentation & Audit Assistance",
    "Transparent & Efficient Process Management",
  ],
  ctaTitle: "Achieve International Standards with Professional ISO Certification Support",
  ctaText:
    "Whether your objective is improving quality systems, ensuring regulatory compliance, strengthening information security, enhancing workplace safety, or expanding into international markets, NCJ Legal Business Solutions LLP provides reliable and professional ISO certification consultancy tailored to your business requirements.",
  ctaButton: "Contact Us Today",
};

export const isoServiceCategories: IsoServiceCategory[] = [
  {
    id: "overview",
    title: "ISO Registration",
    services: [
      {
        id: "iso-registration",
        title: "ISO Registration",
        summary:
          "We provide comprehensive consultancy for obtaining various ISO certifications applicable to manufacturing units, service industries, exporters, healthcare institutions, IT companies, educational institutions, and commercial enterprises.",
        assistanceLabel: "Our Assistance",
        assistance: ["ISO standard selection advisory", "Documentation preparation", "Compliance implementation support", "Audit coordination", "Certification body assistance", "Renewal and surveillance support"],
        benefits: ["International business credibility", "Improved operational efficiency", "Better customer confidence", "Enhanced regulatory compliance", "Increased market opportunities"],
      },
    ],
  },

  {
    id: "standards",
    title: "Popular ISO Standards",
    services: [
      {
        id: "iso-9001",
        title: "ISO 9001:2015",
        summary: "Quality Management Systems (QMS) standard for improved process control and customer satisfaction.",
        assistanceLabel: "Our Services",
        assistance: ["Quality management framework setup", "SOP documentation", "Internal audit assistance", "Certification audit preparation"],
        benefits: ["Improved product and service quality", "Higher customer satisfaction", "Better process control"],
      },
      {
        id: "iso-14001",
        title: "ISO 14001 EMS",
        summary: "Environmental management system standard for sustainability and reduced environmental impact.",
        assistanceLabel: "Our Assistance",
        assistance: ["Environmental compliance assessment", "EMS documentation support", "Audit preparation", "Environmental policy structuring"],
        benefits: ["Environmental compliance", "Reduced environmental impact", "Improved sustainability practices"],
      },
      {
        id: "iso-22000",
        title: "ISO 22000 FSMS",
        summary: "Food Safety Management Systems standard for food manufacturers and supply chains.",
        assistanceLabel: "Our Services",
        assistance: ["Food safety documentation", "HACCP integration support", "Compliance implementation", "Audit coordination"],
        benefits: ["Improved food safety standards", "Consumer confidence enhancement", "Export market eligibility"],
      },
      {
        id: "iso-50001",
        title: "ISO 50001 Certification",
        summary: "Energy management standard for improved energy performance and sustainability.",
        assistanceLabel: "Benefits",
        assistance: ["Energy management implementation", "Documentation support"],
        benefits: ["Reduced energy costs", "Improved energy performance"],
      },
      {
        id: "iso-45001",
        title: "ISO 45001 Certification",
        summary: "Occupational health and safety management system standard for safer workplaces.",
        assistanceLabel: "Our Assistance",
        assistance: ["Safety management system implementation", "Workplace risk assessment", "Compliance documentation", "Audit preparation"],
        benefits: ["Safer workplace environment", "Reduced occupational risks", "Improved employee welfare"],
      },
      {
        id: "iso-20000",
        title: "ISO 20000 Certification",
        summary: "IT service management standard for IT service providers and technology organizations.",
        assistanceLabel: "Our Services",
        assistance: ["IT service management framework implementation", "Documentation and compliance support", "Internal audit assistance"],
        benefits: ["Improved IT service quality", "Better customer support management"] ,
      },
      {
        id: "iso-31000",
        title: "ISO 31000 Certification",
        summary: "Enterprise risk management standard for structured risk assessment and mitigation.",
        assistanceLabel: "Benefits",
        assistance: ["Risk management framework"],
        benefits: ["Better risk identification and mitigation", "Improved decision-making"],
      },
      {
        id: "iso-13485",
        title: "ISO 13485 Certification",
        summary: "Quality management standard for medical device manufacturers and healthcare product businesses.",
        assistanceLabel: "Our Assistance",
        assistance: ["Regulatory documentation support", "Quality compliance implementation", "Audit management"],
        benefits: ["Compliance with medical device standards", "Improved healthcare product quality"],
      },
      {
        id: "iso-21101",
        title: "ISO 21101:2014",
        summary: "Standard for adventure tourism and outdoor activity operators focusing on safety and risk management.",
        assistanceLabel: "Benefits",
        assistance: ["Safety framework support"],
        benefits: ["Improved tourist safety standards", "Risk management enhancement"],
      },
      {
        id: "iso-37001",
        title: "ISO 37001:2016",
        summary: "Anti-bribery management systems standard to prevent corruption and unethical practices.",
        assistanceLabel: "Our Services",
        assistance: ["Anti-bribery policy framework", "Compliance implementation", "Internal control assessment"],
        benefits: ["Improved corporate governance", "Enhanced business ethics"] ,
      },
      {
        id: "iso-27001",
        title: "ISO 27001 ISMS",
        summary: "Information security management standard for organizations handling confidential data.",
        assistanceLabel: "Our Assistance",
        assistance: ["Information security policy implementation", "Cybersecurity compliance support", "Risk assessment", "Audit preparation"],
        benefits: ["Enhanced data security", "Protection against cyber threats"],
      },
      {
        id: "iso-16001",
        title: "ISO 16001 Certification",
        summary: "Social accountability standard for ethical operations and responsible practices.",
        assistanceLabel: "Benefits",
        assistance: ["Social responsibility advisory"],
        benefits: ["Improved social responsibility practices", "Better corporate reputation"],
      },
      {
        id: "iso-39001",
        title: "ISO 39001 Certification",
        summary: "Road traffic safety management standard for transportation and logistics organizations.",
        assistanceLabel: "Our Services",
        assistance: ["Traffic safety compliance framework", "Risk management implementation"],
        benefits: ["Reduced road safety risks", "Improved transportation safety"],
      },
      {
        id: "iso-2768",
        title: "ISO 2768-1 Certification",
        summary: "General tolerances standard improving manufacturing precision and engineering quality.",
        assistanceLabel: "Benefits",
        assistance: ["Tolerance standard advisory"],
        benefits: ["Improved manufacturing precision", "Standardized engineering processes"],
      },
    ],
  },

  {
    id: "process",
    title: "ISO Certification Process & Industries",
    services: [
      {
        id: "process-overview",
        title: "Our End-to-End ISO Certification Process",
        summary: "Requirement analysis, documentation, gap analysis, implementation, audits, training and certification coordination.",
        assistanceLabel: "Our Process Includes",
        assistance: ["Requirement analysis", "Documentation preparation", "Gap analysis", "Compliance implementation", "Internal audit support", "Training and advisory", "Certification coordination", "Post-certification compliance support"],
        benefits: ["Complete certification lifecycle support", "Improved readiness for audits"] ,
      },
      {
        id: "industries",
        title: "Industries We Serve",
        summary: "ISO consultancy for manufacturing, healthcare, food processing, IT, telecom, exporters, logistics, hospitality and more.",
        assistanceLabel: "Industries",
        assistance: ["Manufacturing Industries", "Healthcare & Pharmaceuticals", "Food Processing Units", "IT & Technology Companies", "Telecom & Infrastructure Businesses", "Exporters & Traders", "Logistics & Transportation Companies", "Hospitality & Tourism Businesses", "Engineering & Industrial Units"],
        benefits: ["Industry-specific certification support"],
      },
    ],
  },
];
