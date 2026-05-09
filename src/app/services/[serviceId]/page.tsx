import ServiceForm from "../../../components/service-requests/ServiceForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";

type ServicePageProps = {
  params: {
    serviceId: string;
  };
};

export default async function ServiceRequestPage({ params }: ServicePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    const callbackUrl = `/services/${params.serviceId}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0] px-6 py-20">
      <ServiceForm serviceId={params.serviceId} />
    </main>
  );
}
