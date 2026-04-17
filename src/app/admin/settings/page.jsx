"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Palette, Save } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "Admin",
    email: "admin@ncj.com",
    password: "",
    notifications: true,
    darkMode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#faf6ed] via-[#f5e6c8] to-[#f0ddb0]">
      
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      {/* SETTINGS GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* PROFILE SETTINGS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="text-blue-500" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </motion.div>

        {/* SECURITY SETTINGS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-red-500" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="New Password"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-400"
          />
        </motion.div>

        {/* NOTIFICATIONS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-yellow-500" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>

          <label className="flex items-center justify-between">
            <span>Email Notifications</span>
            <input
              type="checkbox"
              name="notifications"
              checked={form.notifications}
              onChange={handleChange}
            />
          </label>
        </motion.div>

        {/* APPEARANCE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="text-purple-500" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>

          <label className="flex items-center justify-between">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              name="darkMode"
              checked={form.darkMode}
              onChange={handleChange}
            />
          </label>
        </motion.div>
      </div>

      {/* SAVE BUTTON */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex justify-end"
      >
        <button className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-xl shadow-md hover:bg-blue-600 transition">
          <Save size={18} />
          Save Changes
        </button>
      </motion.div>
    </div>
  );
}