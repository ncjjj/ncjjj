import MyConsultations from '../../app/dashboard/MyConsultations';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";

export default function ConsultationsPage() {
  return  ( <div className="dashboard-shell flex">
        {/* Sidebar */}
        <Sidebar />
  
        <div className="dashboard-main flex-1">
          {/* Top Navbar */}
          <TopNavbar />
  
          {/* Main Content */}
          <div className="dashboard-content p-6">
            <MyConsultations />
          </div>
        </div>
      </div>)
}