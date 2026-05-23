import type { ReactNode } from "react";

type AdminLayoutProps = {
  children: ReactNode;
};

export const metadata = {
  title: "Admin - NCJ",
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return children;
}
