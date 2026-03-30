"use client";

import dynamic from "next/dynamic";
import type { MapReport } from "@/components/IssueMap";

const IssueMap = dynamic(
  () => import("@/components/IssueMap").then((m) => m.IssueMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(70vh,560px)] w-full items-center justify-center rounded-2xl border border-dashed border-emerald-800/40 bg-emerald-950/40 text-emerald-200/80">
        Loading map…
      </div>
    ),
  },
);

export function IssueMapDynamic({ reports }: { reports: MapReport[] }) {
  return <IssueMap reports={reports} />;
}
