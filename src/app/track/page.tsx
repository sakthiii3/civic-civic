"use client";

import { useState } from "react";
import { format } from "date-fns";
import { categoryLabels, statusLabels, urgencyLabels } from "@/lib/labels";
import type { IssueCategory, ReportStatus, Urgency } from "@/generated/prisma/enums";
import Image from "next/image";

type History = {
  status: ReportStatus;
  message: string | null;
  at: string;
};

type Report = {
  trackingCode: string;
  title: string;
  status: ReportStatus;
  category: IssueCategory;
  urgency: Urgency;
  createdAt: string;
  updatedAt: string;
  department: { name: string; code: string };
  photoPath: string | null;
  address: string | null;
  history: History[];
};

export default function TrackPage() {
  const [code, setCode] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setReport(null);
    const c = code.trim().toUpperCase();
    try {
      const res = await fetch(
        `/api/reports/track?code=${encodeURIComponent(c)}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error === "Not found" ? "No report with that code." : data.error);
        return;
      }
      setReport(data.report);
    } catch {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Track your report</h1>
      <p className="mt-2 text-emerald-100/85">
        Enter the reference code shown after submission (e.g. JHR-ABC123).
      </p>

      <form
        onSubmit={lookup}
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-sm text-emerald-200">Tracking code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-white uppercase placeholder:normal-case placeholder:text-emerald-200/40"
            placeholder="JHR-…"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-emerald-950 hover:bg-emerald-300 disabled:opacity-60"
        >
          {loading ? "Searching…" : "Track"}
        </button>
      </form>

      {err && (
        <p className="mt-4 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-2 text-sm text-red-100">
          {err}
        </p>
      )}

      {report && (
        <div className="mt-10 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div>
            <p className="font-mono text-sm text-emerald-300">
              {report.trackingCode}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-white">{report.title}</h2>
            <p className="mt-2 text-sm text-emerald-100/80">
              {categoryLabels[report.category]} ·{" "}
              {urgencyLabels[report.urgency]} priority ·{" "}
              <strong>{statusLabels[report.status]}</strong>
            </p>
            <p className="mt-1 text-xs text-emerald-200/60">
              Routed to {report.department.name}
            </p>
            {report.address && (
              <p className="mt-2 text-sm text-emerald-100/70">{report.address}</p>
            )}
          </div>

          {report.photoPath && (
            <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-xl border border-white/10">
              <Image
                src={report.photoPath}
                alt="Report"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-200/90">
              Timeline (simulated notifications)
            </h3>
            <ul className="mt-4 space-y-4 border-l border-emerald-500/30 pl-4">
              {report.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <p className="text-xs text-emerald-200/60">
                    {format(new Date(h.at), "dd MMM yyyy, HH:mm")}
                  </p>
                  <p className="font-medium text-white">
                    {statusLabels[h.status]}
                  </p>
                  {h.message && (
                    <p className="mt-1 text-sm text-emerald-100/80">{h.message}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
