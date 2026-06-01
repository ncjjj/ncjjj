import ServiceForm from "../../../components/service-requests/ServiceForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { createPageMetadata } from "../../../lib/siteMetadata";

type ServicePageProps = {
  params: {
    serviceId: string;
  };
};

export const metadata = createPageMetadata({
  title: "Service Request",
  description: "Secure service request area for NCJ Legal LLP clients.",
  path: "/services",
  noIndex: true,
});

export default async function ServiceRequestPage({ params }: ServicePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    const callbackUrl = `/services/${params.serviceId}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // Service request page hidden: return null to disable UI without deleting file.
  return null;
}
