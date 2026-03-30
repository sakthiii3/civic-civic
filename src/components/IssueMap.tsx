"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import type { IssueCategory, ReportStatus, Urgency } from "@/generated/prisma/enums";
import { categoryLabels, statusLabels, urgencyLabels } from "@/lib/labels";

export type MapReport = {
  id: string;
  trackingCode: string;
  title: string;
  category: IssueCategory;
  urgency: Urgency;
  status: ReportStatus;
  lat: number;
  lng: number;
  address: string | null;
  department: { name: string; code: string };
};

function urgencyColor(u: Urgency): string {
  if (u === "HIGH") return "#f97316";
  if (u === "MEDIUM") return "#eab308";
  return "#22c55e";
}

function statusRing(s: ReportStatus): string {
  if (s === "RESOLVED") return "#10b981";
  if (s === "REJECTED") return "#64748b";
  if (s === "IN_PROGRESS") return "#38bdf8";
  if (s === "ACKNOWLEDGED") return "#a78bfa";
  return "#f472b6";
}

/** 
 * Sub-component to handle automatic map adjustments without unstable root refs.
 * Also handles the "My Location" focus.
 */
function MapController({ validReports }: { validReports: MapReport[] }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  // Focus on user location
  const findMe = () => {
    setLoading(true);
    map.locate().on("locationfound", (e) => {
      map.flyTo(e.latlng, 16);
      setLoading(false);
    }).on("locationerror", () => {
      alert("Could not access your location");
      setLoading(false);
    });
  };

  // Automated bounds adjustment
  useEffect(() => {
    if (validReports.length === 0) return;

    if (validReports.length === 1) {
      map.setView([validReports[0].lat, validReports[0].lng], 16);
      return;
    }

    const bounds = validReports.reduce(
      (acc, r) => {
        acc[0] = Math.min(acc[0], r.lat);
        acc[1] = Math.min(acc[1], r.lng);
        acc[2] = Math.max(acc[2], r.lat);
        acc[3] = Math.max(acc[3], r.lng);
        return acc;
      },
      [validReports[0].lat, validReports[0].lng, validReports[0].lat, validReports[0].lng],
    );

    map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: [40, 40], animate: true }
    );
  }, [map, validReports]);

  return (
    <div className="leaflet-top leaflet-right mt-2 mr-2 pointer-events-auto">
      <div className="leaflet-control leaflet-bar border-none shadow-none bg-transparent">
        <button
          type="button"
          onClick={findMe}
          disabled={loading}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-emerald-600 font-bold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-50"
          title="Focus on my location"
        >
          {loading ? "…" : "📍"}
        </button>
      </div>
    </div>
  );
}

export function IssueMap({ reports }: { reports: MapReport[] }) {
  const valid = useMemo(
    () =>
      reports.filter(
        (r) => Number.isFinite(r.lat) && Number.isFinite(r.lng),
      ),
    [reports],
  );

  return (
    <div className="relative h-[min(70vh,560px)] w-full overflow-hidden rounded-2xl border border-emerald-900/20 shadow-xl">
      <MapContainer
        center={[23.3441, 85.3096]}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapController validReports={valid} />

        {valid.map((r) => (
          <CircleMarker
            key={r.id} // Stable ID from DB
            center={[r.lat, r.lng]}
            radius={8}
            pathOptions={{
              color: statusRing(r.status),
              fillColor: urgencyColor(r.urgency),
              fillOpacity: 0.9,
              weight: 3,
            }}
          >
            <Popup minWidth={200}>
              <div className="text-sm p-1">
                <p className="font-bold text-slate-900 leading-tight">{r.title}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">
                  {r.trackingCode} · {categoryLabels[r.category]}
                </p>
                <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-100 pt-2">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase leading-none mb-1">Status</p>
                    <p className="text-xs font-semibold" style={{ color: statusRing(r.status) }}>
                      {statusLabels[r.status]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-slate-400 uppercase leading-none mb-1">Urgency</p>
                    <p className="text-xs font-semibold" style={{ color: urgencyColor(r.urgency) }}>
                      {urgencyLabels[r.urgency]}
                    </p>
                  </div>
                </div>
                {r.address && (
                  <p className="mt-2 text-[11px] text-slate-600 italic border-t border-slate-50 pt-2 leading-relaxed">
                    {r.address}
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
