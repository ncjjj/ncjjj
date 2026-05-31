"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import PasswordInput from "../common/PasswordInput";

type AdminLoginFormProps = {
  callbackUrl?: string;
};

export default function AdminLoginForm({ callbackUrl = "/admin" }: AdminLoginFormProps) {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        setMessage(payload?.message || "Unable to sign in.");
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setMessage("Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5 rounded-2xl border border-[#e8dcc0] bg-white/90 p-5 shadow-xl sm:rounded-3xl sm:p-8">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#3b2f1c]">Username or Email</label>
        <input
          value={usernameOrEmail}
          onChange={(event) => setUsernameOrEmail(event.target.value)}
          className="w-full min-w-0 rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 outline-none focus:border-[#b89b5e]"
          placeholder="Enter username or email"
        />
      </div>
      <PasswordInput
        id="admin-password"
        label="Password"
        value={password}
        onChange={setPassword}
        required
        autoComplete="current-password"
        className="space-y-2"
        labelClassName="mb-2 block text-sm font-medium text-[#3b2f1c]"
        inputClassName="w-full min-w-0 rounded-xl border border-[#e5d7b6] bg-white px-4 py-3 pr-20 outline-none focus:border-[#b89b5e]"
        buttonClassName="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-[#e5d7b6] bg-white px-3 py-1 text-xs font-semibold text-[#6b5b3e] transition hover:bg-[#f6efdf]"
        placeholder="Enter password"
      />
      {message ? <p className="text-sm text-red-600">{message}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-gradient-to-r from-[#6b5b3e] to-[#b89b5e] px-4 py-3 font-semibold text-white disabled:opacity-70"
      >
        {submitting ? "Signing in..." : "Admin Sign In"}
      </button>
    </form>
  );
}
