"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  LifeBuoy,
  Menu,
} from "lucide-react";
import { useState } from "react";

const links = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  console.log("Current pathname:", pathname);

  return (
    <div
      className={`h-screen ${
        collapsed ? "w-20" : "w-64"
      } transition-all duration-300 
      bg-white/80 dark:bg-gray-900/80 backdrop-blur-md 
      shadow-lg p-4 flex flex-col`}
    >
      {/* TOP */}
      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            NCJ Admin
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* LINKS */}
      <ul className="space-y-2 flex-1">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <motion.li
              key={link.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all
                ${
                  isActive
                    ? "bg-blue-500 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            </motion.li>
          );
        })}
      </ul>

      {/* BOTTOM */}
      {!collapsed && (
        <div className="mt-auto text-xs text-gray-400 text-center">
          © 2026 NCJ
        </div>
      )}
    </div>
  );
}