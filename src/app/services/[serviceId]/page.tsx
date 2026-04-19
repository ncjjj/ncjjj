import ServiceForm from "../../../components/service-requests/ServiceForm";

type ServicePageProps = {
  params: {
    serviceId: string;
  };
};

export default function ServiceRequestPage({ params }: ServicePageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0] px-6 py-20">
      <ServiceForm serviceId={params.serviceId} />
    </main>
  );
}
