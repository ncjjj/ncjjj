import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashboardShell from "./DashboardShell";
import { authOptions } from "../../lib/auth";
import { createPageMetadata } from "../../lib/siteMetadata";
import type { ReactNode } from "react";

type DashboardLayoutProps = {
  children: ReactNode;
};

export const metadata = createPageMetadata({
  title: "Client Dashboard",
  description: "Secure NCJ Legal LLP client dashboard.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
