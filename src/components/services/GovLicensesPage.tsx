"use client";

import { govPageContent, govServiceCategories } from "../../app/services/licenses/data";
import GenericServicePage from "./GenericServicePage";

export default function GovLicensesPage() {
  return (
    <GenericServicePage
      pageContent={govPageContent}
      serviceCategories={govServiceCategories as any}
    />
  );
}

