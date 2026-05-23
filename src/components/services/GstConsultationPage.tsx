"use client";

import { gstPageContent, gstServiceCategories } from "../../app/services/gst-consultation/data";
import GenericServicePage from "./GenericServicePage";

export default function GstConsultationPage() {
  return (
    <GenericServicePage
      pageContent={gstPageContent}
      serviceCategories={gstServiceCategories as any}
    />
  );
}

