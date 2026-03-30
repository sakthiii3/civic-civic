import { IssueMapDynamic } from "@/components/IssueMapDynamic";
import { prisma } from "@/lib/prisma";
import type { MapReport } from "@/components/IssueMap";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const rows = await prisma.report.findMany({
    select: {
      id: true,
      trackingCode: true,
      title: true,
      category: true,
      urgency: true,
      status: true,
      lat: true,
      lng: true,
      address: true,
      department: { select: { name: true, code: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const reports = rows as MapReport[];

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-white">Live issue map</h1>
      <p className="mt-2 max-w-2xl text-emerald-100/85">
        Markers combine urgency (fill) and status (ring). Data updates when you
        refresh — wire to WebSockets or polling for full real-time later.
      </p>
      <div className="mt-8">
        <IssueMapDynamic reports={reports} />
      </div>
      <p className="mt-4 text-xs text-emerald-200/50">
        {reports.length} reports loaded · OpenStreetMap tiles
      </p>
    </main>
  );
}
