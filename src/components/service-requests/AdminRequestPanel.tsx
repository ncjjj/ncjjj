"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role?: string;
};

export default function AdminRequestPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) return;
        const payload = await res.json();
        if (!mounted) return;
        setUsers(payload.users || []);
      } catch (err) {
        // silent
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Admin Dashboard</h1>
          <p className="text-sm text-[#4b5563]">Users and documents</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-[#d1d5db] bg-white p-4">
        <h2 className="text-lg font-semibold text-[#111827]">Registered Users ({users.length})</h2>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex-1">
            <input
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              placeholder="Search users by name, email or mobile"
              className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={() => setUserFilter("")}
              className="ml-2 rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-[#6b7280]">
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Email</th>
                <th className="px-2 py-2">Mobile</th>
                <th className="px-2 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => {
                  const term = userFilter.trim().toLowerCase();
                  if (!term) return true;
                  return (
                    u.name.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term) ||
                    u.mobileNumber.toLowerCase().includes(term)
                  );
                })
                .map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/admin/users/${user.id}/documents`)}
                    className="border-t border-[#e5e7eb] text-[#1f2937] cursor-pointer"
                  >
                    <td className="px-2 py-2">{user.name}</td>
                    <td className="px-2 py-2">{user.email}</td>
                    <td className="px-2 py-2">{user.mobileNumber}</td>
                    <td className="px-2 py-2 capitalize">{user.role}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
