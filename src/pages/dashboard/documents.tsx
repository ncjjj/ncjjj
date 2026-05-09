import YearlyDocuments from '../../app/dashboard/YearlyDocuments';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";
export default function DocumentsPage() {



  return     (<div className="dashboard-shell flex">
          {/* Sidebar */}
          <Sidebar />
    
          <div className="dashboard-main flex-1">
            {/* Top Navbar */}
            <TopNavbar />
    
            {/* Main Content */}
            <div className="dashboard-content p-6">
              <YearlyDocuments />
            </div>
          </div>
        </div>)
}