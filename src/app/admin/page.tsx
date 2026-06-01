import AdminDashboard from "../../components/admin/AdminDashboard";
import { createPageMetadata } from "../../lib/siteMetadata";

export const metadata = createPageMetadata({
  title: "Admin Dashboard",
  description: "Private dashboard for NCJ Legal LLP administrators.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return <AdminDashboard />;
}
