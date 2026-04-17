import Payments from '../../app/dashboard/Payments';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";
export default function PaymentsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <TopNavbar />
        <Payments />
      </div>
    </div>
  );
}