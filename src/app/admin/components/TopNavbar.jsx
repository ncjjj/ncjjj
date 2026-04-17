"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { useThemeContext } from "@/context";

export default function TopNavbar() {
  const { theme, toggleTheme } = useThemeContext();

  return (
    <div className="flex items-center justify-between px-6 py-4 
    bg-white/80 dark:bg-gray-900/80 backdrop-blur-md 
    shadow-md rounded-xl mx-4 mt-4">

      {/* LEFT */}
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-semibold text-gray-800 dark:text-white"
      >
        Admin Dashboard
      </motion.h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* SEARCH */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="ml-2 bg-transparent outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:scale-105 transition"
        >
          {theme === "light" ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </button>

        {/* NOTIFICATIONS */}
        <button className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:scale-105 transition">
          <Bell size={18} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* AVATAR */}
        <motion.div whileHover={{ scale: 1.1 }}>
          <Image
            src="/avatar.png" // 👉 replace with your image
            alt="Admin Avatar"
            width={36}
            height={36}
            className="rounded-full border-2 border-gray-300 dark:border-gray-700"
          />
        </motion.div>
      </div>
    </div>
  );
}