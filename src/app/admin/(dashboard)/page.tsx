import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { categoryLabels, statusLabels, urgencyLabels } from "@/lib/labels";
import type { IssueCategory, ReportStatus } from "@/generated/prisma/enums";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
  }>;
};

export default async function AdminInboxPage({ searchParams }: Props) {
  const { staff } = await requireStaff();
  if (!staff) return null;
  const sp = await searchParams;

  const status =
    sp.status && sp.status !== "ALL" ? (sp.status as ReportStatus) : undefined;
  const category =
    sp.category && sp.category !== "ALL"
      ? (sp.category as IssueCategory)
      : undefined;
  const q = sp.q?.trim();

  const where: Prisma.ReportWhereInput = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (staff.role === "STAFF" && staff.departmentId) {
    where.departmentId = staff.departmentId;
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { trackingCode: { contains: q } },
    ];
  }

  const reports = await prisma.report.findMany({
    where,
    include: { department: true },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    take: 150,
  });

  const statuses = Object.keys(statusLabels) as ReportStatus[];
  const categories = Object.keys(categoryLabels) as IssueCategory[];

  function buildQuery(patch: Partial<{ status: string; category: string; q: string }> = {}) {
    const p = new URLSearchParams();
    const st = patch.status !== undefined ? patch.status : sp.status;
    const cat = patch.category !== undefined ? patch.category : sp.category;
    const qq = patch.q !== undefined ? patch.q : sp.q;
    if (st && st !== "ALL") p.set("status", st);
    if (cat && cat !== "ALL") p.set("category", cat);
    if (qq) p.set("q", qq);
    const s = p.toString();
    return s ? `?${s}` : "";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Report inbox</h1>
      <p className="mt-1 text-sm text-emerald-100/70">
        Routed issues — newest and highest urgency first.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin" method="get">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search title or code…"
          className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
        />
        {(sp.status && sp.status !== "ALL") ||
        (sp.category && sp.category !== "ALL") ? (
          <>
            {sp.status && sp.status !== "ALL" && (
              <input type="hidden" name="status" value={sp.status} />
            )}
            {sp.category && sp.category !== "ALL" && (
              <input type="hidden" name="category" value={sp.category} />
            )}
          </>
        ) : null}
        <button
          type="submit"
          className="rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-medium text-emerald-950"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="py-1 text-emerald-200/60">Status:</span>
        <Link
          href={`/admin${buildQuery({ status: "ALL" })}`}
          className={`rounded-full px-2 py-1 ${!status ? "bg-white/15 text-white" : "text-emerald-200/80 hover:bg-white/10"}`}
        >
          All
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin${buildQuery({ status: s })}`}
            className={`rounded-full px-2 py-1 ${status === s ? "bg-white/15 text-white" : "text-emerald-200/80 hover:bg-white/10"}`}
          >
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="py-1 text-emerald-200/60">Category:</span>
        <Link
          href={`/admin${buildQuery({ category: "ALL" })}`}
          className={`rounded-full px-2 py-1 ${!category ? "bg-white/15 text-white" : "text-emerald-200/80 hover:bg-white/10"}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c}
            href={`/admin${buildQuery({ category: c })}`}
            className={`rounded-full px-2 py-1 ${category === c ? "bg-white/15 text-white" : "text-emerald-200/80 hover:bg-white/10"}`}
          >
            {categoryLabels[c]}
          </Link>
        ))}
      </div>

      <ul className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/30">
        {reports.length === 0 && (
          <li className="px-4 py-10 text-center text-emerald-200/60">
            No reports match filters.
          </li>
        )}
        {reports.map((r) => (
          <li key={r.id}>
            <Link
              href={`/admin/reports/${r.id}`}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 transition hover:bg-white/5"
            >
              <div>
                <p className="font-mono text-xs text-emerald-300">
                  {r.trackingCode}
                </p>
                <p className="font-medium text-white">{r.title}</p>
                <p className="mt-1 text-xs text-emerald-100/70">
                  {categoryLabels[r.category]} · {urgencyLabels[r.urgency]} ·{" "}
                  {r.department.name}
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-100">
                  {statusLabels[r.status]}
                </span>
                <p className="mt-2 text-emerald-200/50">
                  {format(r.createdAt, "dd MMM yyyy HH:mm")}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
