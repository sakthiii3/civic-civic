import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { categoryLabels, statusLabels } from "@/lib/labels";
import { ReportStatus, IssueCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { staff } = await requireStaff();
  if (!staff) return null;
  if (staff.role !== "ADMIN") redirect("/admin");

  const [total, byStatus, byCategory] = await Promise.all([
    prisma.report.count(),
    prisma.report.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.report.groupBy({
      by: ["category"],
      _count: { _all: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Analytics snapshot</h1>
      <p className="mt-1 text-sm text-emerald-100/70">
        Reporting mix and volume — extend with time-series and SLA charts.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <p className="text-sm text-emerald-200/80">Total reports</p>
          <p className="mt-2 text-4xl font-bold text-white">{total}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="font-semibold text-white">By status</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {byStatus.map((b: any) => (
              <li
                key={b.status}
                className="flex justify-between border-b border-white/5 py-2 text-emerald-100/90"
              >
                <span>{statusLabels[b.status as ReportStatus]}</span>
                <span className="font-mono text-emerald-300">{b._count._all}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
          <h2 className="font-semibold text-white">By category</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {byCategory.map((b: any) => (
              <li
                key={b.category}
                className="flex justify-between border-b border-white/5 py-2 text-emerald-100/90"
              >
                <span>{categoryLabels[b.category as IssueCategory]}</span>
                <span className="font-mono text-emerald-300">{b._count._all}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
