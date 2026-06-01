import type { ReactNode } from "react";
import { createPageMetadata } from "../../lib/siteMetadata";

type AdminLayoutProps = {
  children: ReactNode;
};

export const metadata = createPageMetadata({
  title: "Admin",
  description: "Private NCJ Legal LLP administration area.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }: AdminLayoutProps) {
  return children;
}
