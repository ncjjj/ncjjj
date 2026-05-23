import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { authOptions } from "../../lib/auth";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
