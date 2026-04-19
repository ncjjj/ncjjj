import { unstable_cache } from "next/cache";

const loadAboutPageData = unstable_cache(
  async () => {
    // Replace this with DB/API reads in production.
    return {
      firmName: "NCJ & Associates",
      yearsOfExperience: 12,
      activeClients: 320,
      supportEmail: "support@ncjassociates.com",
      consultationPath: "/dashboard/book",
    };
  },
  ["about-page-data"],
  { revalidate: 300 }
);

export async function getAboutPageData() {
  return loadAboutPageData();
}
