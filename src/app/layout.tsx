import "./globals.css";
import "../styles/responsive.css";
import AppProviders from "../context/AppProviders";
import AppShell from "../components/layout/AppShell";
import { StructuredData } from "../components/common/StructuredData";
import type { ReactNode } from "react";

type RootLayoutProps = {
  children: ReactNode;
};

export const metadata = {
  title: {
    default: "NCJ Legal LLP",
    template: "%s | NCJ Legal LLP",
  },
  description: "Expert GST and ITR filing services. Get professional tax consultation, accounting support, and document management. File your taxes with certified professionals.",
  keywords: "GST filing, ITR filing, tax consultation, CA firm, accounting services, tax advisory",
  authors: [{ name: "NCJ Legal LLP" }],
  creator: "NCJ Legal LLP",
  publisher: "NCJ Legal LLP",
  icons: {
    icon: "/images/ncj.jpeg",
    shortcut: "/images/ncj.jpeg",
    apple: "/images/ncj.jpeg",
  },
  
  // Open Graph Tags (Social Media)
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://yoursite.com",
    siteName: "NCJ Legal LLP",
    title: "NCJ Legal LLP - GST & ITR Filing Services",
    description: "Expert tax consultation and filing services for GST, ITR, and accounting support",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NCJ Legal LLP Services",
      },
    ],
  },
  
  // Twitter Tags
  twitter: {
    card: "summary_large_image",
    title: "NCJ Legal LLP - GST & ITR Filing Services",
    description: "Expert tax consultation and filing services",
    creator: "@yourhandle",
    images: ["/images/og-image.jpg"],
  },
  
  // Additional Meta Tags
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  formatDetection: {
    telephone: true,
    address: true,
  },
  
  // Alternate Languages
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://yoursite.com",
    languages: {
      "en": "https://yoursite.com/en",
      "hi": "https://yoursite.com/hi",
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* Theme Color for Mobile */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Structured Data */}
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
