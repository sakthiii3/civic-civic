"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { ReportStatus } from "@/generated/prisma/enums";
import { categoryLabels, statusLabels, urgencyLabels } from "@/lib/labels";

type Dept = { id: string; name: string; code: string };

type HistoryRow = {
  id: string;
  status: ReportStatus;
  note: string | null;
  publicMessage: string | null;
  createdAt: string;
  staff: { name: string; email: string } | null;
};

type ReportPayload = {
  id: string;
  trackingCode: string;
  title: string;
  description: string;
  category: keyof typeof categoryLabels;
  urgency: keyof typeof urgencyLabels;
  status: ReportStatus;
  lat: number;
  lng: number;
  address: string | null;
  photoPath: string | null;
  voiceNotePath: string | null;
  citizenName: string | null;
  citizenPhone: string | null;
  citizenEmail: string | null;
  createdAt: string;
  department: Dept;
  history: HistoryRow[];
};

const statusOptions: ReportStatus[] = [
  "SUBMITTED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "REJECTED",
];

export function AdminReportClient({
  report: initial,
  departments,
  isAdmin,
}: {
  report: ReportPayload;
  departments: Dept[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ReportStatus>(initial.status);
  const [departmentId, setDepartmentId] = useState(initial.department.id);
  const [publicMessage, setPublicMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const body: Record<string, string> = {};
      if (status !== initial.status) body.status = status;
      if (isAdmin && departmentId !== initial.department.id) {
        body.departmentId = departmentId;
      }
      if (publicMessage.trim()) body.publicMessage = publicMessage.trim();
      if (internalNote.trim()) body.internalNote = internalNote.trim();

      const res = await fetch(`/api/admin/reports/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Update failed");
        return;
      }
      setPublicMessage("");
      setInternalNote("");
      if (data.report?.status) setStatus(data.report.status);
      if (data.report?.departmentId && isAdmin) {
        setDepartmentId(data.report.departmentId);
      }
      router.refresh();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin"
        className="text-sm text-emerald-300/80 hover:text-emerald-200"
      >
        ← Inbox
      </Link>

      <div>
        <p className="font-mono text-sm text-emerald-300">{initial.trackingCode}</p>
        <h1 className="mt-1 text-2xl font-bold text-white">{initial.title}</h1>
        <p className="mt-2 text-sm text-emerald-100/80">
          {categoryLabels[initial.category]} · {urgencyLabels[initial.urgency]} ·{" "}
          {statusLabels[initial.status]}
        </p>
        <p className="mt-1 text-xs text-emerald-200/60">
          Routed: {initial.department.name} ({initial.department.code})
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-emerald-100/90">
        <p className="whitespace-pre-wrap">{initial.description}</p>
        {initial.address && (
          <p className="mt-3 text-xs text-emerald-200/70">{initial.address}</p>
        )}
        <p className="mt-3 font-mono text-xs text-emerald-300/80">
          {initial.lat.toFixed(5)}, {initial.lng.toFixed(5)}
        </p>
        {(initial.citizenName || initial.citizenPhone || initial.citizenEmail) && (
          <div className="mt-4 border-t border-white/10 pt-3 text-xs">
            <p className="text-emerald-200/60">Reporter</p>
            {initial.citizenName && <p>{initial.citizenName}</p>}
            {initial.citizenPhone && <p>{initial.citizenPhone}</p>}
            {initial.citizenEmail && <p>{initial.citizenEmail}</p>}
          </div>
        )}
      </div>

      {initial.photoPath && (
        <div className="relative aspect-video max-w-xl overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={initial.photoPath}
            alt="Attachment"
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      <form
        onSubmit={save}
        className="space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-6"
      >
        <h2 className="font-semibold text-white">Update status</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-emerald-200">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReportStatus)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className="bg-emerald-950">
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </div>
          {isAdmin && departments.length > 0 && (
            <div>
              <label className="text-sm text-emerald-200">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id} className="bg-emerald-950">
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-emerald-200">
            Public update (visible on citizen track page timeline)
          </label>
          <textarea
            value={publicMessage}
            onChange={(e) => setPublicMessage(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
            placeholder="Short citizen-facing note…"
          />
        </div>

        <div>
          <label className="text-sm text-emerald-200">Internal note (staff only)</label>
          <textarea
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
          />
        </div>

        {err && <p className="text-sm text-red-300">{err}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-emerald-400 px-6 py-2.5 font-semibold text-emerald-950 hover:bg-emerald-300 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save update"}
        </button>
      </form>

      <div>
        <h2 className="font-semibold text-white">Activity</h2>
        <ul className="mt-4 space-y-3 border-l border-white/10 pl-4">
          {initial.history.map((h) => (
            <li key={h.id} className="text-sm">
              <p className="text-xs text-emerald-200/50">
                {format(new Date(h.createdAt), "dd MMM yyyy HH:mm")}
                {h.staff && ` · ${h.staff.name}`}
              </p>
              <p className="font-medium text-emerald-100">
                {statusLabels[h.status]}
              </p>
              {h.publicMessage && (
                <p className="text-emerald-50/90">{h.publicMessage}</p>
              )}
              {h.note && (
                <p className="text-xs text-emerald-300/70">Note: {h.note}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
