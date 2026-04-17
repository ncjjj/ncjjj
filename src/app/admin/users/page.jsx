"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, ShieldCheck, Ban } from "lucide-react";

const usersData = [
  { id: 1, name: "Ayush Sharma", role: "Admin", status: "Active" },
  { id: 2, name: "Ritik Rai", role: "User", status: "Active" },
  { id: 3, name: "Kushagra", role: "Moderator", status: "Blocked" },
  { id: 4, name: "Aman Verma", role: "User", status: "Active" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const filteredUsers = usersData.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>

        {/* SEARCH */}
        <div className="flex items-center bg-white px-3 py-2 rounded-xl shadow-md w-72">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="ml-2 outline-none w-full bg-transparent"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4"
        >
          <User className="text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <h2 className="text-xl font-semibold">{usersData.length}</h2>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4"
        >
          <ShieldCheck className="text-green-500" />
          <div>
            <p className="text-gray-500 text-sm">Active Users</p>
            <h2 className="text-xl font-semibold">
              {usersData.filter(u => u.status === "Active").length}
            </h2>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4"
        >
          <Ban className="text-red-500" />
          <div>
            <p className="text-gray-500 text-sm">Blocked</p>
            <h2 className="text-xl font-semibold">
              {usersData.filter(u => u.status === "Blocked").length}
            </h2>
          </div>
        </motion.div>

      </div>

      {/* USER CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  user.status === "Active"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {user.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Role: {user.role}
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-500 text-white py-1 rounded-lg hover:bg-blue-600 transition">
                View
              </button>
              <button className="flex-1 bg-yellow-500 text-white py-1 rounded-lg hover:bg-yellow-600 transition">
                Edit
              </button>
              <button className="flex-1 bg-red-500 text-white py-1 rounded-lg hover:bg-red-600 transition">
                Block
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredUsers.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No users found.
        </div>
      )}
    </div>
  );
}