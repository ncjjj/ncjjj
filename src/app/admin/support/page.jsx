"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";

const ticketsData = [
  {
    id: 1,
    title: "Login issue",
    user: "Ayush Sharma",
    status: "Open",
    priority: "High",
  },
  {
    id: 2,
    title: "Payment failed",
    user: "Ritik Rai",
    status: "Pending",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Bug in dashboard",
    user: "Kushagra",
    status: "Closed",
    priority: "Low",
  },
  {
    id: 4,
    title: "Unable to upload file",
    user: "Aman Verma",
    status: "Open",
    priority: "High",
  },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredTickets = ticketsData.filter((ticket) => {
    return (
      (filter === "All" || ticket.status === filter) &&
      ticket.title.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>

        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="flex items-center bg-white px-3 py-2 rounded-xl shadow-md w-64">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="ml-2 outline-none w-full bg-transparent"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* FILTER */}
          <select
            className="bg-white px-3 py-2 rounded-xl shadow-md"
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Open</option>
            <option>Pending</option>
            <option>Closed</option>
          </select>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4">
          <MessageSquare className="text-blue-500" />
          <div>
            <p className="text-gray-500 text-sm">Total Tickets</p>
            <h2 className="text-xl font-semibold">{ticketsData.length}</h2>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4">
          <AlertTriangle className="text-yellow-500" />
          <div>
            <p className="text-gray-500 text-sm">Open</p>
            <h2 className="text-xl font-semibold">
              {ticketsData.filter(t => t.status === "Open").length}
            </h2>
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-2xl shadow-lg flex items-center gap-4">
          <CheckCircle className="text-green-500" />
          <div>
            <p className="text-gray-500 text-sm">Closed</p>
            <h2 className="text-xl font-semibold">
              {ticketsData.filter(t => t.status === "Closed").length}
            </h2>
          </div>
        </motion.div>

      </div>

      {/* TICKET CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">{ticket.title}</h2>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ticket.status === "Open"
                    ? "bg-yellow-100 text-yellow-600"
                    : ticket.status === "Pending"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {ticket.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-2">
              User: {ticket.user}
            </p>

            <p
              className={`text-xs mb-4 font-medium ${
                ticket.priority === "High"
                  ? "text-red-500"
                  : ticket.priority === "Medium"
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              Priority: {ticket.priority}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-500 text-white py-1 rounded-lg hover:bg-blue-600 transition">
                View
              </button>
              <button className="flex-1 bg-green-500 text-white py-1 rounded-lg hover:bg-green-600 transition">
                Resolve
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredTickets.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No tickets found.
        </div>
      )}
    </div>
  );
}