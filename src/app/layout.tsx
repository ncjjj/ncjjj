import "./globals.css";
import "../styles/responsive.css";
import AppProviders from "../context/AppProviders";
import AppShell from "../components/layout/AppShell";
import { StructuredData } from "../components/common/StructuredData";
import {
  absoluteUrl,
  defaultDescription,
  defaultKeywords,
  defaultTitle,
  metadataBase,
  siteName,
  siteUrl,
  socialImagePath,
} from "../lib/siteMetadata";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  applicationName: siteName,
  description: defaultDescription,
  keywords: defaultKeywords,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "Legal, tax and business compliance services",
  icons: {
    icon: "/images/ncj.jpeg",
    shortcut: "/images/ncj.jpeg",
    apple: "/images/ncj.jpeg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName,
    title: `${siteName} - ${defaultTitle}`,
    description: defaultDescription,
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        alt: `${siteName} services`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - ${defaultTitle}`,
    description: defaultDescription,
    images: [socialImagePath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: true,
    address: true,
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <StructuredData />
      </head>
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
