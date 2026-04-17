'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard Overview', path: '/dashboard' },
  { name: 'My Consultations', path: '/dashboard/consultations' },
  { name: 'Book Appointment', path: '/dashboard/book-appointment' },
  { name: 'Documents', path: '/dashboard/documents' },
  { name: 'Payments', path: '/dashboard/payments' },
  { name: 'Messages', path: '/dashboard/messages' },
  { name: 'Profile Settings', path: '/dashboard/profile' },
  { name: 'Notifications', path: '/dashboard/notifications' },
  { name: 'Support Center', path: '/dashboard/support' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    alert('You have been logged out.');
    router.push('/auth');
  };

  return (
    <div className="w-64 h-screen flex flex-col justify-between
      bg-gradient-to-b from-[#f5e6c8] via-[#faf6ed] to-[#fffaf0]
      border-r border-gray-200 shadow-lg"
    >
      
      {/* Top Section */}
      <div>
        <div className="p-6 text-xl font-bold tracking-tight text-gray-800">
          Consultancy
        </div>

        <nav className="px-3 space-y-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.path;

            return (
              <Link key={index} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
                  ${
                    isActive
                      ? 'bg-white shadow-md text-black'
                      : 'text-gray-600 hover:bg-white/70 hover:shadow-sm'
                  }`}
                >
                  {/* Optional icon placeholder */}
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium shadow-md hover:scale-[1.02] transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}