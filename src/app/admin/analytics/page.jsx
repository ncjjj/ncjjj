"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { BarChart3, TrendingUp, FileText } from "lucide-react";

const userData = [
  { name: "Jan", users: 200 },
  { name: "Feb", users: 400 },
  { name: "Mar", users: 650 },
  { name: "Apr", users: 900 },
];

const ticketData = [
  { name: "Jan", tickets: 50 },
  { name: "Feb", tickets: 120 },
  { name: "Mar", tickets: 80 },
  { name: "Apr", tickets: 160 },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0]">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <p className="text-gray-500">Track performance and insights</p>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Monthly Growth</p>
              <h2 className="text-xl font-bold text-green-600">+18%</h2>
            </div>
            <TrendingUp className="text-green-500" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Reports</p>
              <h2 className="text-xl font-bold">24</h2>
            </div>
            <FileText className="text-blue-500" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">Engagement Rate</p>
              <h2 className="text-xl font-bold text-purple-600">76%</h2>
            </div>
            <BarChart3 className="text-purple-500" />
          </div>
        </motion.div>

      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">

        {/* USER GROWTH */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* TICKET ANALYTICS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Ticket Analytics</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ticketData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tickets" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* REPORTS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-2xl shadow-lg"
      >
        <h2 className="text-lg font-semibold mb-4">Download Reports</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            Download User Report
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
            Download Ticket Report
          </button>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition">
            Download Full Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}