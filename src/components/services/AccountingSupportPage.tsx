"use client";

import { accountingPageContent, accountingServiceCategories } from "../../app/services/accounting-support/data";
import GenericServicePage from "./GenericServicePage";

export default function AccountingSupportPage() {
  return (
    <GenericServicePage
      pageContent={accountingPageContent}
      serviceCategories={accountingServiceCategories as any}
    />
  );
}

