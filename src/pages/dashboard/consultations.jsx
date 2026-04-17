import MyConsultations from '../../app/dashboard/MyConsultations';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";

export default function ConsultationsPage() {
  return  ( <div className="flex">
        {/* Sidebar */}
        <Sidebar />
  
        <div className="flex-1">
          {/* Top Navbar */}
          <TopNavbar />
  
          {/* Main Content */}
          <div className="p-6">
            <MyConsultations />
          </div>
        </div>
      </div>)
}