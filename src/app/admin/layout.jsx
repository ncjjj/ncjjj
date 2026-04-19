import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import AdminClientProviders from "./AdminClientProviders";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/login?error=AccessDenied");
  }

  return (
    <AdminClientProviders>
      {children}
    </AdminClientProviders>
  );
}