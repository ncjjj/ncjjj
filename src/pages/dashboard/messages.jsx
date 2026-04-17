import Messages from '../../app/dashboard/Messages';
import Sidebar from "../../app/dashboard/components/Sidebar";
import TopNavbar from "../../app/dashboard/components/TopNavbar";

export default function MessagesPage() {
  return     (<div className="flex">
          {/* Sidebar */}
          <Sidebar />
    
          <div className="flex-1">
            {/* Top Navbar */}
            <TopNavbar />
    
            {/* Main Content */}
            <div className="p-6">
              <Messages />
            </div>
          </div>
        </div>)
}