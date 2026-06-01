import { createPageMetadata } from "../../lib/siteMetadata";
import type { ReactNode } from "react";

type PrivacyLayoutProps = {
  children: ReactNode;
};

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "Read how NCJ Legal LLP collects, uses, protects and retains client information for tax, legal, accounting and compliance services.",
  path: "/privacy",
  keywords: [
    "NCJ Legal privacy policy",
    "client data protection",
    "tax service privacy",
    "compliance service privacy",
  ],
});

export default function PrivacyLayout({ children }: PrivacyLayoutProps) {
  return children;
}
