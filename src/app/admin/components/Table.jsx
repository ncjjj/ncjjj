"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

export default function Table({ headers, data }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [asc, setAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  // 🔍 Search filter
  const filteredData = data.filter((row) =>
    headers.some((key) =>
      String(row[key]).toLowerCase().includes(search.toLowerCase())
    )
  );

  // 🔃 Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    if (a[sortKey] < b[sortKey]) return asc ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return asc ? 1 : -1;
    return 0;
  });

  // 📄 Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (key) => {
    if (sortKey === key) {
      setAsc(!asc);
    } else {
      setSortKey(key);
      setAsc(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4">

      {/* 🔍 SEARCH */}
      <div className="flex items-center mb-4 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl w-64">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="ml-2 bg-transparent outline-none text-sm text-gray-700 dark:text-white"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📊 TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* HEADER */}
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              {headers.map((header) => (
                <th
                  key={header}
                  onClick={() => handleSort(header)}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    {header}
                    {sortKey === header &&
                      (asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {paginatedData.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {headers.map((header) => (
                  <td
                    key={header}
                    className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200"
                  >
                    {row[header]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ❌ EMPTY STATE */}
      {paginatedData.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          No data found.
        </div>
      )}

      {/* 📄 PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Page {currentPage} of {totalPages || 1}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
          >
            Prev
          </button>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 hover:scale-105 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}