import "./globals.css";
import AppProviders from "../context/AppProviders";
import AppShell from "../components/layout/AppShell";
import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata = {
  title: "CA Firm",
  description: "GST and ITR filing services",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
