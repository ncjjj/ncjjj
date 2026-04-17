import Documents from '../../app/dashboard/Documents';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";
export default function DocumentsPage() {



  return     (<div className="flex">
          {/* Sidebar */}
          <Sidebar />
    
          <div className="flex-1">
            {/* Top Navbar */}
            <TopNavbar />
    
            {/* Main Content */}
            <div className="p-6">
              <Documents />
            </div>
          </div>
        </div>)
}