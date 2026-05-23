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

  // Service request page hidden: return null to disable UI without deleting file.
  return null;
}
