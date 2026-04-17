"use client";

import { motion } from "framer-motion";
import { Users, Ticket, Activity, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0]">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back, Admin 👋</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* USERS */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h2 className="text-2xl font-bold">1,248</h2>
            </div>
            <Users className="text-blue-500" />
          </div>
        </motion.div>

        {/* TICKETS */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Support Tickets</p>
              <h2 className="text-2xl font-bold">342</h2>
            </div>
            <Ticket className="text-yellow-500" />
          </div>
        </motion.div>

        {/* ACTIVITY */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Active Sessions</p>
              <h2 className="text-2xl font-bold">89</h2>
            </div>
            <Activity className="text-green-500" />
          </div>
        </motion.div>

        {/* GROWTH */}
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Growth</p>
              <h2 className="text-2xl font-bold text-green-600">+12%</h2>
            </div>
            <TrendingUp className="text-green-500" />
          </div>
        </motion.div>

      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* RECENT ACTIVITY */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

          <div className="space-y-4">
            {[
              "New user registered",
              "Ticket #231 resolved",
              "Admin updated settings",
              "User blocked for spam",
            ].map((activity, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-2"
              >
                <p className="text-gray-600">{activity}</p>
                <span className="text-xs text-gray-400">Just now</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="flex flex-col gap-3">
            <button className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
              Add New User
            </button>
            <button className="bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition">
              View Tickets
            </button>
            <button className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
              Generate Report
            </button>
            <button className="bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition">
              System Settings
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}