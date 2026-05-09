import DashboardOverview from '../../app/dashboard/DashboardOverview';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";


export default function DashboardPage() {
  return ( <div className="dashboard-shell flex">
          {/* Sidebar */}
          <Sidebar />
    
          <div className="dashboard-main flex-1">
            {/* Top Navbar */}
            <TopNavbar />
    
            {/* Main Content */}
            <div className="dashboard-content p-6">
              <DashboardOverview/>
            </div>
          </div>
        </div>)
}