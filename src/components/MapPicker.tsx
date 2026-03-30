"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";

// Fix for default Leaflet marker icons in Next.js/Webpack
// Defined outside to prevent re-creation
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/**
 * Sub-component to sync the map center when props change externally (e.g. Detect location)
 */
function SyncCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { animate: true });
  }, [map, lat, lng]);
  return null;
}

interface MapPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return <Marker position={[lat, lng]} icon={icon} />;
}

export function MapPicker({ lat, lng, onChange }: MapPickerProps) {
  return (
    <div className="h-[300px] w-full mt-2 overflow-hidden rounded-xl border border-white/10 ring-1 ring-emerald-500/20 relative">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <SyncCenter lat={lat} lng={lng} />
        <LocationMarker lat={lat} lng={lng} onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] rounded bg-emerald-950/90 px-2 py-1 text-[10px] text-emerald-200 border border-emerald-400/20 backdrop-blur">
        Tip: Click on the map to pin the exact location.
      </div>
    </div>
  );
}
