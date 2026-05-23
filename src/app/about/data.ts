import { unstable_cache } from "next/cache";

const loadAboutPageData = unstable_cache(
  async () => {
    
    return {
      firmName: "NCJ LLP",
      yearsOfExperience: 60,
      activeClients: 320,
      supportEmail: "support@ncjassociates.com",
      consultationPath: "/contact",
    };
  },
  ["about-page-data"],
  { revalidate: 300 }
);

export async function getAboutPageData() {
  return loadAboutPageData();
}
