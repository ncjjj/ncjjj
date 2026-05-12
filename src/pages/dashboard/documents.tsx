import YearlyDocuments from '../../app/dashboard/YearlyDocuments';
import PermanentDocuments from '../../app/dashboard/PermanentDocuments';
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
            <div className="dashboard-content space-y-8 p-6">
              <PermanentDocuments />
              <YearlyDocuments />
            </div>
          </div>
        </div>)
}
