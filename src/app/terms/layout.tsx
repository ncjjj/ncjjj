import { createPageMetadata } from "../../lib/siteMetadata";
import type { ReactNode } from "react";

type TermsLayoutProps = {
  children: ReactNode;
};

export const metadata = createPageMetadata({
  title: "Terms and Conditions",
  description:
    "Review the terms and conditions for using NCJ Legal LLP tax, legal, accounting, registration and compliance services.",
  path: "/terms",
  keywords: [
    "NCJ Legal terms",
    "service terms",
    "tax filing terms",
    "legal service conditions",
  ],
});

export default function TermsLayout({ children }: TermsLayoutProps) {
  return children;
}
