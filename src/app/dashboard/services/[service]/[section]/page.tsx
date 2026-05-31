import { notFound } from "next/navigation";
import ServiceDocumentManager from "../../../../../components/dashboard/ServiceDocumentManager";
import { DASHBOARD_SERVICE_GROUPS } from "../../../../../lib/serviceAccess";

type PageProps = {
  params: {
    service: string;
    section: string;
  };
};

export default function ServiceSectionPage({ params }: PageProps) {
  const service = DASHBOARD_SERVICE_GROUPS.find((item) => item.key === params.service);

  if (!service) {
    notFound();
  }

  const section = service.sections.find((item) => item.key === params.section);

  if (!section) {
    notFound();
  }

  return (
    <ServiceDocumentManager
      serviceKey={service.key}
      serviceLabel={service.label}
      sectionKey={section.key}
      sectionLabel={section.label}
      requiresFinancialYear={section.requiresFinancialYear ?? false}
    />
  );
}
