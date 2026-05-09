"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() ?? "";
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="page-content">{children}</div>
      <Footer />
    </>
  );
}