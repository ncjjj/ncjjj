"use client";

import { motion } from "framer-motion";

export default function Card({
  title,
  children,
  icon: Icon,
  action,
  className = "",
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-5 rounded-2xl shadow-md 
      bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
      border border-gray-200 dark:border-gray-700
      transition-all ${className}`}
    >
      {/* HEADER */}
      {(title || Icon || action) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon size={18} className="text-blue-500" />}
            {title && (
              <h2 className="text-md font-semibold text-gray-800 dark:text-white">
                {title}
              </h2>
            )}
          </div>

          {action && <div>{action}</div>}
        </div>
      )}

      {/* CONTENT */}
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </motion.div>
  );
}