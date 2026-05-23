"use client";

import { ngoPageContent, ngoServiceCategories } from "../../app/services/ngo/data";
import GenericServicePage from "./GenericServicePage";

export default function NgoServicesPage() {
  return (
    <GenericServicePage
      pageContent={ngoPageContent}
      serviceCategories={ngoServiceCategories as any}
    />
  );
}
