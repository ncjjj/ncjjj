import type { Metadata } from "next";

const LOCAL_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const url = new URL(withProtocol);
    url.pathname = url.pathname.replace(/\/+$/, "");
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalizeSiteUrl(process.env.NEXT_PUBLIC_APP_URL) ??
  normalizeSiteUrl(process.env.NEXTAUTH_URL) ??
  normalizeSiteUrl(process.env.VERCEL_URL) ??
  LOCAL_SITE_URL;

export const metadataBase = new URL(siteUrl);

export const siteName = "NCJ Legal LLP";

export const defaultTitle = "GST, ITR, Legal and Business Compliance Services";

export const defaultDescription =
  "NCJ Legal LLP provides GST registration, ITR filing, accounting, business registration, legal documentation, licensing and compliance services across India.";

export const defaultKeywords = [
  "GST registration",
  "GST return filing",
  "ITR filing",
  "income tax filing",
  "business registration",
  "company registration",
  "legal documentation",
  "accounting services",
  "tax consultant India",
  "NCJ Legal LLP",
];

export const socialImagePath = "/images/ncj.jpeg";

export function absoluteUrl(path = "/"): string {
  return new URL(path, metadataBase).toString();
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  imagePath?: string;
  noIndex?: boolean;
};

function uniqueKeywords(keywords: string[] = []) {
  return Array.from(new Set([...keywords, ...defaultKeywords]));
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  imagePath = socialImagePath,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(imagePath);

  return {
    title,
    description,
    keywords: uniqueKeywords(keywords),
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      siteName,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteName} - ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
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
  };
}
