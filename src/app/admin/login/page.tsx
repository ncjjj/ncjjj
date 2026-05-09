"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/admin/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Invalid admin credentials.");
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[#d8d8cf] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#1f2937]">Admin Login</h1>
        <p className="mt-2 text-sm text-[#4b5563]">Use admin username and password to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm text-[#374151]">
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              autoComplete="username"
            />
          </label>

          <label className="block space-y-2 text-sm text-[#374151]">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
