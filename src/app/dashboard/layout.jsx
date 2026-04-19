import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { authOptions } from "../../lib/auth";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
