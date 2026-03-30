"use client";

import dynamic from "next/dynamic";

export const MapPickerDynamic = dynamic(
  () => import("./MapPicker").then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-emerald-800/40 bg-emerald-950/40 text-sm text-emerald-200/80 mt-4 flex">
        Map initializing…
      </div>
    ),
  }
);
