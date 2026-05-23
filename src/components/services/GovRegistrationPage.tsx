"use client";

import { regPageContent, regServiceCategories } from "../../app/services/registration/data";
import GenericServicePage from "./GenericServicePage";

export default function GovRegistrationPage() {
  return (
    <GenericServicePage
      pageContent={regPageContent}
      serviceCategories={regServiceCategories as any}
    />
  );
}

