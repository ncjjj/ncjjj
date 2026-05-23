"use client";

import { bizPageContent, bizServiceCategories } from "../../app/services/business-setup/data";
import GenericServicePage from "./GenericServicePage";

export default function BusinessSetupPage() {
  return (
    <GenericServicePage
      pageContent={bizPageContent}
      serviceCategories={bizServiceCategories as any}
    />
  );
}

