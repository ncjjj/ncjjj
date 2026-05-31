"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Header = dynamic(() => import("./Header"), { ssr: false });
const Footer = dynamic(() => import("./Footer"), { ssr: false });
const SupportPopup = dynamic(() => import("./SupportPopup"), { ssr: false });

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <div className="admin-page-content">{children}</div>;
  }

  return (
    <>
      <Header />
      <div className="page-content">{children}</div>
      <Footer />
      <SupportPopup />
    </>
  );
}
