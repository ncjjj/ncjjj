"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
} from "lucide-react";

const items = [
  {
    title: "Dashboard",
    desc: "View system overview and activity",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500/20 to-blue-300/10",
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  {
    title: "Users",
    desc: "Manage users and roles",
    href: "/admin/users",
    icon: Users,
    color: "from-purple-500/20 to-purple-300/10",
    iconBg: "bg-purple-500/10 text-purple-600",
  },
  {
    title: "Analytics",
    desc: "View reports and insights",
    href: "/admin/analytics",
    icon: BarChart3,
    color: "from-emerald-500/20 to-emerald-300/10",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Support",
    desc: "Handle support tickets",
    href: "/admin/support",
    icon: LifeBuoy,
    color: "from-yellow-500/20 to-yellow-300/10",
    iconBg: "bg-yellow-500/10 text-yellow-600",
  },
  {
    title: "Settings",
    desc: "Configure system preferences",
    href: "/admin/settings",
    icon: Settings,
    color: "from-pink-500/20 to-pink-300/10",
    iconBg: "bg-pink-500/10 text-pink-600",
  },
];

export default function AdminPage() {
  return (
    <div className="relative p-6 min-h-screen overflow-hidden bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0]">

      {/* BACKGROUND GLOW */}
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-purple-300/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-300/30 rounded-full blur-3xl"></div>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 relative z-10"
      >
        <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
          Welcome to NCJ Admin 
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Manage your platform with precision and control
        </p>
      </motion.div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">

        {items.map((item, i) => {
          const Icon = item.icon;

          return (
            <Link key={i} href={item.href}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 180 }}
                className={`relative group rounded-2xl p-[1px] bg-gradient-to-br ${item.color}`}
              >
                {/* INNER CARD */}
                <div className="relative h-full rounded-2xl bg-white/70 backdrop-blur-xl p-5 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">

                  {/* SHINE EFFECT */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%]"></div>

                  {/* CONTENT */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${item.iconBg}`}>
                      <Icon size={20} />
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* SYSTEM STATUS PANEL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 relative z-10"
      >
        <div className="rounded-2xl bg-white/70 backdrop-blur-xl p-6 border border-white/30 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            System Status
          </h2>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              All systems operational
            </div>

            <div className="flex items-center gap-2 text-blue-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              No critical issues detected
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}