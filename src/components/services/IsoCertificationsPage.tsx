"use client";

import { isoPageContent, isoServiceCategories } from "../../app/services/iso-certifications/data";
import GenericServicePage from "./GenericServicePage";

export default function IsoCertificationsPage() {
  return (
    <GenericServicePage
      pageContent={isoPageContent}
      serviceCategories={isoServiceCategories as any}
    />
  );
}
