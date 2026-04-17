import DashboardOverview from '../../app/dashboard/DashboardOverview';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";


export default function DashboardPage() {
  return ( <div className="flex">
          {/* Sidebar */}
          <Sidebar />
    
          <div className="flex-1">
            {/* Top Navbar */}
            <TopNavbar />
    
            {/* Main Content */}
            <div className="p-6">
              <DashboardOverview/>
            </div>
          </div>
        </div>)
}