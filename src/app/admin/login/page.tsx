"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@jharkhand.gov.in");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Login failed");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-4 py-20">
      <Link
        href="/"
        className="mb-8 text-sm text-emerald-300/80 hover:text-emerald-200"
      >
        ← Back to site
      </Link>
      <h1 className="text-2xl font-bold text-white">Staff sign in</h1>
      <p className="mt-2 text-sm text-emerald-100/70">
        Municipal dashboard — filters, assignments, and analytics.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
      >
        <div>
          <label className="text-sm text-emerald-200">Email</label>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white"
          />
        </div>
        <div>
          <label className="text-sm text-emerald-200">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white"
            placeholder="Demo: admin123"
          />
        </div>
        {err && (
          <p className="text-sm text-red-300">{err}</p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-emerald-400 py-3 font-semibold text-emerald-950 hover:bg-emerald-300 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
