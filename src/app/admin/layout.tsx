import type { ReactNode } from "react";
import AdminProviders from "./context/AdminProviders";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#111827]">
      <AdminProviders>{children}</AdminProviders>
    </div>
  );
}