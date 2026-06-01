import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/siteMetadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/dashboard"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 0,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
