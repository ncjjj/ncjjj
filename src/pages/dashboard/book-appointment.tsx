import BookAppointment from '../../app/dashboard/book/page';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";

export default function BookAppointmentPage() {
  return (
    <div className="dashboard-shell flex">
      {/* Sidebar */}
      <Sidebar />

      <div className="dashboard-main flex-1">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Main Content */}
        <div className="dashboard-content p-6">
          <BookAppointment />
        </div>
      </div>
    </div>
  );
}